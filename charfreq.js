class DefaultMap extends Map {
    constructor(defaultvalue){
        super();
        this.defaultvalue = defaultvalue;
    }
    get(key){
        if (this.has(key))
            return super.get(key);
        else
            return this.defaultvalue;
    }
}

class Histogram {
    constructor() {
        this.letterCounts = new DefaultMap(0);
        this.totalLetters = 0;
    }
    add(text){
        text = text.replace(/\s/g, "").toUpperCase();
        for(let character of text) {
            let count = this.letterCounts.get(character);
            this.letterCounts.set(character, count + 1);
            this.totalLetters ++;
        }
    }

    toString(){
        let entries = [...this.letterCounts];
        entries.sort((a,b)=>{
            if(a[1]===b[1]) {
                return a[0] < b[0] ? -1:1;
            }else{
                return b[1] - a[1];
            }
        });

        console.log(entries)

        for(let entry of entries)
            entry[1] = entry[1] / this.totalLetters * 100;

        entries = entries.filter(entry => entry[1] >=1);

        let lines = entries.map(([letter, number]) => `${letter} ${"#".repeat(Math.round(number))} ${number.toFixed(3)}%`);

        return lines.join("\n");
    }
}


async function histogramFromStdIn(){
    process.stdin.setEncoding("utf-8");
    let hist = new Histogram;
    hist.xxx=1
    for await(let chunk of process.stdin){
        hist.add(chunk);
        hist.xxx++;
        console.log(hist.toString());
    }
    console.log(hist['xxx']);
    console.log(hist.xxx);
    return hist;
}

histogramFromStdIn().then(hist=>{console.log(hist.toString());})
