# ELF format

Use `readelf -lSW /bin/cat` to get a summary of linking and execution views, the execution view assumes virtual address 0 as base.

Comparing the information with the output of `cat /proc/self/maps | node rm_base.js` we know:
 * if you run it multiple times, the address of each binary's VMA is changing each time, so Linux loads ELF into a randomized virtual address area.
 * but the layout of each binary is fixed and aligned with what readelf says.

*rm_base.js is a nodejs app removes the base address of each vma in /proc/xxx/maps, so we can see things more clear*.

~~~js
var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var base={};

function hexp(num, size=16) {
    num = num.toString(16);
    while (num.length < size) num = "0" + num;
    return num;
}

rl.on('line', function(line){
	let m = line.match(/^([\da-f]*)-([\da-f]*).*\s(\/.*)/);
	if(!m) return;

	addr0 = parseInt(m[1],16);
	addr1 = parseInt(m[2],16);
	elf = m[3]
	if (!base[elf]) {
		console.log(`\n========= ${elf} is loaded at ${hexp(addr0)}`);
		base[elf]=addr0;
	}
    console.log(`${hexp(addr0-base[elf])} - ${hexp(addr1-base[elf])}  ${line}`);
})

~~~

`readelf -rW /bin/bash` shows the relocation table (each entry contains information of a reference to external dynamic symbol - typically a function call to another shared-library). The dynamic linker has to resolve the needed symbol by its name, and then write the symbol address to the place specified in the relocation entry.

check https://greek0.net/elf.html for:
 * Program loading in the kernel
 * Dynamic linking and the ELF interpreter

Note: Both executables (program & library) are relocated before being executed, both are position independent code (local jmp/call are relative to RIP).

# How ftrace/uprobe works?

https://www.kernel.org/doc/Documentation/trace/uprobetracer.txt

from kernel source /kernel/events/uprobes.c, it replace the first instruction at user-space address with a breakpoint instruction (on x86, it's `int3`).

uptest.c:
~~~C
#include <stdio.h>
#include <stdlib.h>

void test(int cnt)
{
    FILE * fp = fopen("dump.bin","w");
    if(!fp)
        return;
    fwrite(test, cnt, 1, fp);
    fclose(fp);
    system("objdump -D -Mintel,x86-64 -b binary -m i386 dump.bin");
}

void main(int argc, char * argv[])
{
    test(32);
}
~~~

~~~bash
$ gcc uptest.c -g
$ # check the offset of the function to be probed
$ objdump -t ./a.out | grep -w test   # nm ./a.out | grep test
00000000000007fa g     F .text  0000000000000066              test
$ # add a uprobe
$ echo 'p /home/hddl/a.out:0x7fa' | sudo tee /sys/kernel/debug/tracing/uprobe_events
$ # enable uprobe
$ echo 1 | sudo tee /sys/kernel/debug/tracing/events/uprobes/enable
$ ./a.out
~~~
we can see the first instruction of test() changed from `push rbp` to `int3`.

So just like GDB, uprobe is a debuger in the kernel, after it got that int3, it can resume the target by following procedure:
  * changing `int3` back to `push rbp`;
  * switch on [single-step mode](https://en.wikipedia.org/wiki/Trap_flag) for the target;
  * resume target execution;
  * target single step `push rbp` and trapped again;
  * uprobe changes the `push rbp` back to `int3` again;
  * switch off [single-step mode](https://en.wikipedia.org/wiki/Trap_flag);
  * resume target execution.

Since there are many switching between kernel/user space, it would be less efficient for light-weighted functions. but this method also have many benefits:
 * requires no re-compile;
 * many out-of-the-box probing features;
 * support return probe;

you can do the same thing in user-space by attaching GDB to a process and add breakpoint with commands.
 * `break *0x0000000000400448` will break at address 0x0000000000400448;
 * use `commands [bnum] ... end`  syntax to add commands when breakpoint is hit;
~~~
commands 1
silent
printf "x is %d\n",x
cont
end
~~~

https://ftp.gnu.org/old-gnu/Manuals/gdb/html_node/gdb_28.html

# Tracing a program

Is it possible to trace a program at minimal cost for goods of both learning and debugging?

[etrace](https://github.com/elcritch/etrace) showed a way of using gcc's -finstrument-functions option to trace each function call. but it only provides function address, some post processing based on "nm" or "objdump" is required to convert it into line-number.

~~~bash
../bin/intel64/Debug/cpuFuncTests --gtest_filter="smoke_Activation_Basic/ActivationLayerTest.CompareWithRefs/Cos_IS=(1.50)_AS=()_ConstantsValue=()_netPRC=FP32_inPRC=UNSPECIFIED_outPRC=UNSPECIFIED_inL=ANY_outL=ANY_trgDev=CPU"
~~~

https://www.brendangregg.com/blog/2015-06-28/linux-ftrace-uprobe.html

https://stackoverflow.com/questions/311840/tool-to-trace-local-function-calls-in-linux


Keep looking I found a more powerful concept & tool:
 * [Record and replay debugging](https://en.wikipedia.org/wiki/Record_and_replay_debugging)
 * [rr](https://en.wikipedia.org/wiki/Rr_(debugging))
