// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{

	const theta = rotation * Math.PI / 180;

	const affine_matrix = [ 
		scale * Math.cos(theta), scale * Math.sin(theta), 0,
		-scale * Math.sin(theta), scale * Math.cos(theta), 0,
		positionX, positionY, 1
	]
	return affine_matrix;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	const res_matrix = new Array(9);
	for (let i=0; i<3; i++){
		for (let j=0; j<3; j++){
			elem = 0;
			for (let k=0; k<3; k++){
				let index_trans2 = i + (k * 3);
				let index_trans1 = k + (j * 3);
				elem += trans2[index_trans2] * trans1[index_trans1];

			}
			res_matrix[i + (j * 3)] = elem;
		}
	}

	return res_matrix;
}
