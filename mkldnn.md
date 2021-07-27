# ROI pooling

 * [spec on github](https://github.com/openvinotoolkit/openvino/blob/master/docs/ops/detection/ROIPooling_1.md)
 * [ngraph ref](https://github.com/openvinotoolkit/openvino/blob/252483bb836bd1902ece9a166c9c228409eaf11a/ngraph/core/reference/include/ngraph/runtime/reference/roi_pooling.hpp#L104)
 * [mkldnn kernel](https://github.com/openvinotoolkit/openvino/blob/252483bb836bd1902ece9a166c9c228409eaf11a/inference-engine/src/mkldnn_plugin/nodes/mkldnn_roi_pooling_node.cpp#L161)
 * [cldnn kernel](https://github.com/openvinotoolkit/openvino/blob/master/inference-engine/thirdparty/clDNN/kernel_selector/core/cl_kernels/roi_pooling_ref.cl)

## Blocked layout

[oneDNN memory format](https://oneapi-src.github.io/oneDNN/dev_guide_understanding_memory_formats.html)

![image](https://oneapi-src.github.io/oneDNN/mem_fmt_blk.png)


| index    | strides (in unit of sizeof(element)) |
| --------------- | --------------------- |
| n               | ceil(C/8) * H * W * 8 |
| c1 = floor(c/8) | H * W * 8 |
| h               | W * 8 |
| w               | 8 |
| c2 = c % 8      | 1 |

Thus we can see since stride of w is always 8, so the channel is padded when (C%8 > 0).

In this layout, SIMD registers can be easily loaded with spatially neighbours comes from different channels:

| addr | reg | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---- |---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0 | ymm0 | (0,7,0,0) | (0,6,0,0) | (0,5,0,0) | (0,4,0,0) | (0,3,0,0) | (0,2,0,0) | (0,1,0,0) | (0,0,0,0) |
| [y * (W * 8) + x * 8] * sizeof(float) | ymm1 | (0,7,y,x) | (0,6,y,x) | (0,5,y,x) | (0,4,y,x) | (0,3,y,x) | (0,2,y,x) | (0,1,y,x) | (0,0,y,x) |


since majority SIMD instructions operate between two packed data vertically, so this blocked layout is good choice when the task is mainly involving spatially neighbours.

