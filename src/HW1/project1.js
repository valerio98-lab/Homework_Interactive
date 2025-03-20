// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) {
    const bg_width = bgImg.width;
    const bg_height = bgImg.height;
    const fg_width = fgImg.width;
    const fg_height = fgImg.height;

    for (let i = 0; i < fg_height; i++) {
        for (let j = 0; j < fg_width; j++) {
            const blended_x = j + fgPos.x;
            const blended_y = i + fgPos.y;
            
            if (blended_x < 0 || blended_x >= bg_width || blended_y < 0 || blended_y >= bg_height) {
                continue;
            }
            
            let fg_index = (i * fg_width + j) * 4;
            let bg_index = (blended_y * bg_width + blended_x) * 4;

            let fgR = fgImg.data[fg_index];
            let fgG = fgImg.data[fg_index + 1];
            let fgB = fgImg.data[fg_index + 2];
            let fgA = (fgImg.data[fg_index + 3] / 255) * fgOpac;

            let bgR = bgImg.data[bg_index];
            let bgG = bgImg.data[bg_index + 1];
            let bgB = bgImg.data[bg_index + 2];
            let bgA = bgImg.data[bg_index + 3] / 255;
            
            var outA = fgA + (1 - fgA) * bgA;
            
            if (outA > 0) {
                let outR = (fgR * fgA + (1 - fgA) * bgR * bgA) / outA;
                var outG = (fgG * fgA + (1 - fgA) * bgG * bgA) / outA;
                var outB = (fgB * fgA + (1 - fgA) * bgB * bgA) / outA;
                
                bgImg.data[bg_index] = outR;
                bgImg.data[bg_index + 1] = outG;
                bgImg.data[bg_index + 2] = outB;
                bgImg.data[bg_index + 3] = outA * 255;
            } else {
                bgImg.data[bg_index] = 0;
                bgImg.data[bg_index + 1] = 0;
                bgImg.data[bg_index + 2] = 0;
                bgImg.data[bg_index + 3] = 0;
            }
        }
    }
}


// function VectorToMatrix(image){
//     var {data, width, height} = image;
//     var matrix = [];

//     for (let i = 0; i < height; i++){
//         var row = [];
//         for (let j = 0; j < width; j++){
//             var index = (i * width + j) * 4;
//             row.push([data[index], data[index + 1], data[index + 2], data[index + 3] / 255]);
//         }
//         matrix.push(row);
//     }

//     return matrix;
// }

// function MatrixToVector(matrix, image){
//     var {data, width, height} = image;

//     for (let i = 0; i < height; i++){
//         for (let j=0; j<width; j++){
//             var index = (i * width + j) * 4;
//             var p = matrix[i][j];
            
//             data[index] = p[0];
//             data[index + 1] = p[1];
//             data[index + 2] = p[2];
//             data[index + 3] = p[3] * 255;
//         }
//     }

//     return image;
// }
