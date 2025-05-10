// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rot_x = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), -Math.sin(rotationX), 0,
		0, Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

	var rot_y = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];

	var rot = MatrixMult(rot_y, rot_x);

	var combined_matrix = MatrixMult(trans, rot);
	var mvp = MatrixMult( projectionMatrix, combined_matrix );
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	constructor()
	{
		this.prog = InitShaderProgram(this.vertex_shader, this.fragment_shader);
        gl.useProgram(this.prog);

        this.swap_YZ = gl.getUniformLocation(this.prog, 'swap_YZ');
        this.show_texture = gl.getUniformLocation(this.prog, 'show_texture');
			
		gl.uniform1i(this.swap_YZ, document.getElementById('swap-yz').checked ? 1 : 0);
        gl.uniform1i(this.show_texture, document.getElementById('show-texture').checked ? 1 : 0);

		this.vertex = gl.getAttribLocation(this.prog, 'vertex');
        this.vertex_buffer = gl.createBuffer();
        this.text_coords = gl.getAttribLocation(this.prog, 'texture_coordinates');
        this.text_coords_buffer = gl.createBuffer();
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');

		
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh(vertPos, texCoords)
	{	
		// [TO-DO] Update the contents of the vertex buffer objects.
        gl.useProgram(this.prog);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.text_coords_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		this.num_triangles = vertPos.length / 3;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap)
	{
        gl.useProgram(this.prog);
		if(swap) {
			gl.uniform1i(this.swap_YZ, 1);
		} 
		else {
			gl.uniform1i(this.swap_YZ, 0);
		}

	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans)
	{
        gl.useProgram(this.prog);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.text_coords_buffer);
        gl.vertexAttribPointer(this.text_coords, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.text_coords);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(this.vertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertex);

		gl.uniformMatrix4fv(this.mvp, false, new Float32Array(trans));
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, this.num_triangles);
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img)
	{
		// [TO-DO] Bind the texture
        gl.useProgram(this.prog);

        const texture = gl.createTexture();
        const mipmaplvl = 0;

        gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, mipmaplvl, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        var sampler = gl.getUniformLocation(this.prog, 'texture');
        gl.uniform1i(sampler, 0);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show)
	{
        gl.useProgram(this.prog);

        if (show) { 
			gl.uniform1i(this.show_texture, 1); 
		}
        else {
			gl.uniform1i(this.show_texture, 0); 

			}
	}

vertex_shader = `
    uniform int  swap_YZ;
    uniform bool show_texture; 
    uniform mat4 mvp;

    attribute vec2 texture_coordinates;
    attribute vec3 vertex;

    varying vec2 v_uv;

    void main() {
        vec4 v = vec4(vertex, 1.0);
        if (swap_YZ == 1) {         
            v = vec4(v.x, v.z, v.y, v.w);
        }
        v_uv = texture_coordinates;  
        gl_Position = mvp * v;
    }
`;


fragment_shader = `
    precision mediump float;

    uniform bool show_texture;
    uniform sampler2D texture;

    varying vec2 v_uv;

    void main() {
        if (show_texture) {
            gl_FragColor = texture2D(texture, v_uv);
        } else {
            gl_FragColor = vec4(0.6, 0.6, 0.6, 1.0);  
        }
    }
`;

}