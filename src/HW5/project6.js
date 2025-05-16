var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		Light light = lights[i];

		// TO-DO: Check for shadows

        vec3 toLight = light.position - position;
        float distToLight = length(toLight);            
        Ray shadowRay;
        shadowRay.pos = position + normal * 1e-3;   // offset to avoid self-intersection        
        shadowRay.dir = toLight / distToLight;             

		HitInfo sHit;
        bool inShadow = IntersectRay( sHit, shadowRay ) &&
                        sHit.t < distToLight - 1e-3;        

        if ( inShadow )
            continue;
		
		// TO-DO: If not shadowed, perform shading using the Blinn model

		vec3 N = normalize(normal);        
        vec3 L = shadowRay.dir;           
        vec3 V = view;                    
		
        float NdotL  = max( dot(N, L), 0.0 );
        vec3  diffuse = mtl.k_d * NdotL;

        vec3  H       = normalize( L + V );
        float NdotH   = max( dot(N, H), 0.0 );
        vec3  specular = mtl.k_s * pow( NdotH, mtl.n );

        color += light.intensity * ( diffuse + specular );
    }

	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{

	hit.t = 1e30;
	bool foundHit = false;


	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection

		Sphere sphere = spheres[i];
        vec3 d = normalize(ray.dir);
        vec3 p = ray.pos;

		float radius = sphere.radius;
		float a = dot(d,d);
        float b = dot((2.0 * d), (p - sphere.center));
        float c = dot((p - sphere.center), (p - sphere.center)) - pow(radius, 2.0);
        float det = pow(b,2.0) - (4.0*a*c);


		// TO-DO: If intersection is found, update the given HitInfo
        if(det >= 0.0) {
           det = sqrt(det);
           float t = (-b - det) / (2.00*a);

           if (t > 1e-3 && t < hit.t) {
             hit.t = t;
             hit.position = p + t * d;

             hit.normal = (hit.position - sphere.center) / radius;
             hit.mtl = sphere.mtl;

             foundHit = true;
           }
        };
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;

		// TO-DO: Initialize the reflection ray

		Ray r;	// this is the reflection ray
		r.pos = hit.position; 
		r.dir = 2.0 * dot(view, normalize(hit.normal)) * hit.normal - view;
		r.dir = normalize(r.dir);

		HitInfo h;	// reflection hit info
			
		
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			

			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				
				vec3 r_view = (-r.dir);
				vec3 c = Shade(h.mtl, h.position, h.normal, r_view);
				
				// TO-DO: Update the loop variables for tracing the next reflection ray
				
                clr += k_s * c;
                k_s = h.mtl.k_s;

				r.pos = h.position;
                r.dir = 2.0 * dot(r_view, h.normal) * h.normal - r_view;
                r.dir = normalize(r.dir);
				
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 1.0 );	// return the environment color
	}
}
`;