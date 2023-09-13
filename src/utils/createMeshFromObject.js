import * as THREE from 'three';

export const createGeometryFromFacets = (facets) => {
  const geometry = new THREE.BufferGeometry();

  const normals = new Float32Array(facets.length * 3 * 3);
  const vertices = new Float32Array(facets.length * 3 * 3);

  for (let i = 0; i < facets.length; i++) {
    const item = facets[i];
    if (!item) {
      continue;
    }
    for (let j = 0; j < 3; j++) {
      const bp = i * 9 + j * 3;
      normals[bp] = item.normal[0];
      normals[bp + 1] = item.normal[1];
      normals[bp + 2] = item.normal[2];

      vertices[bp] = item.vertices[j][0];
      vertices[bp + 1] = item.vertices[j][1];
      vertices[bp + 2] = item.vertices[j][2];
    }
  }

  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  return geometry;
};

/**
 * Creates a mesh from an objects with normals and vertices
 * @param {Array} facets This is an array of facet with normals and vertices
 * @returns THREE.Mesh
 */
export const createMeshFromObject = (facets) => {
  const geometry = createGeometryFromFacets(facets);

  const material = new THREE.MeshStandardMaterial({
    color: '#0000ff',
    opacity: 0.2,
    transparent: true,
    side: THREE.DoubleSide,
    wireframe: true,
  });
  return new THREE.Mesh(geometry, material);
};
