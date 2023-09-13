import { Hashtable } from "./hashTable";
import * as THREE from 'three';

/**
 * Creates the mesh with offset
 * @param {String} data The data to read
 * @param {Number} offset The offset number to offset the mesh
 */
export const createOffsetMesh = (position, normal, offset) => {
  const faces = normal.length / 3 / 3;
  const initialObjects = new Array(faces);
  const newObjects = new Array(faces);
  for (let i = 0; i < faces; i++) {
    const bp = i * 9;
    initialObjects[i] = {
      face: i,
      normal: [normal[bp], normal[bp + 1], normal[bp + 2]],
      vertices: [
        [position[bp], position[bp + 1], position[bp + 2]],
        [position[bp + 3], position[bp + 4], position[bp + 5]],
        [position[bp + 6], position[bp + 7], position[bp + 8]],
      ],
    };
    newObjects[i] = {
      face: i,
      normal: null,
      vertices: [null, null, null],
    };
  }

  const hashTable = createHashTableWithObject(initialObjects);
  console.log(hashTable.size, hashTable.conflict);

  const finalObjects = calcOffset(hashTable, newObjects, offset);

  return finalObjects;
};

/**
 * Create an hashTable with the initial objects - reduce the complexity of the algorithm
 * @param {Array} initialObjects The data from the file
 * @returns HashTable of objects with the same vertex
 */
const createHashTableWithObject = (initialObjects) => {
  const hashTable = new Hashtable(initialObjects.length);

  for (var i = 0; i < initialObjects.length; i++) {
    for (var j = 0; j < initialObjects[i].vertices.length; j++) {
      // key: the current vertex initialObjects[i].vertices[j]
      // value: the face initialObjects[i].face, the normal initialObjects[i].normal and the position j
      hashTable.set(initialObjects[i].vertices[j], {
        face: initialObjects[i].face,
        normal: initialObjects[i].normal,
        vertexPositionInTheObject: j,
      });
    }
  }

  return hashTable;
};

/**
 * Calculates the offset of the object
 * @param {Hashtable} hashTable The hashTable with the initial objects
 * @param {Array} newObjects The final objects
 * @param {Number} offset The offset to move the mesh
 * @returns The new objects with the offset
 */
const calcOffset = (hashTable, newObjects, offset) => {
  for (var i = 0; i < hashTable.data.length; i++) {
    if (hashTable.data[i]) {
      for (var j = 0; j < hashTable.data[i].length; j++) {
        const vextex = hashTable.data[i][j][0];
        const objects = hashTable.data[i][j][1];

        const normalsSum = calcNormalsSum(objects);
        const normalizedNormal = normalizeNormal(normalsSum);
        const newPosition = calcNewPosition(offset, normalizedNormal, vextex);
        for (let k = 0; k < objects.length; k++) {
          const list = objects[k];
          const newObject = newObjects[list.face];
          newObject.vertices[list.vertexPositionInTheObject] = newPosition;
        }
      }
    }
  }

  for (let i = 0; i < newObjects.length; i++) {
    const item = newObjects[i];
    const newNormal = calculateNewNormal(
      item.vertices[0],
      item.vertices[1],
      item.vertices[2],
    );
    item.normal = newNormal;
  }

  return newObjects;
};

/**
 * Calculates the sum of the normals of the faces
 * @param {Array} tempList Array of objects with the same vertex
 * @returns The sum of all the normals
 */
const calcNormalsSum = (tempList) => {
  // const result = tempList.reduce((prev, curr) => prev + curr.normal, 0);
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (let i = 0; i < tempList.length; i++) {
    const item = tempList[i];
    sumX += item.normal[0];
    sumY += item.normal[1];
    sumZ += item.normal[2];
  }

  return [sumX, sumY, sumZ];
};

/**
 * Normalizes the normal vector
 * @param {Array} normal The normal
 * @returns The normalized normal
 */
const normalizeNormal = (normal) => {
  const modul = Math.sqrt(
    normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2],
  );
  if (modul <= 1e-8) {
    return [0, 0, 0];
  }

  const normalizedNormal = [
    normal[0] / modul,
    normal[1] / modul,
    normal[2] / modul,
  ];

  return normalizedNormal;
};

/**
 * Calculates the new position of the vertex
 * @param {Number} offset The offset
 * @param {Array} normal The normal
 * @param {Array} vertex The vertex
 * @returns The new position of the vertex
 */
const calcNewPosition = (offset, normal, vertex) => {
  const nx = vertex[0] + normal[0] * offset;
  const ny = vertex[1] + normal[1] * offset;
  const nz = vertex[2] + normal[2] * offset;
  return [nx, ny, nz];
};

/**
 * Calculates the new normal of the face
 * @param {Array} v1 The first vertex
 * @param {Array} v2 The second vertex
 * @param {Array} v3 The third vertex
 * @returns The new normal
 */
const calculateNewNormal = (v1, v2, v3) => {
  const x21 = v2[0] - v1[0];
  const y21 = v2[1] - v1[1];
  const z21 = v2[2] - v1[2];
  const x31 = v3[0] - v1[0];
  const y31 = v3[1] - v1[1];
  const z31 = v3[2] - v1[2];

  const nx = y21 * z31 - z21 * y31;
  const ny = -(x21 * z31 - z21 * x31);
  const nz = x21 * y31 - y21 * x31;

  const normal = [nx, ny, nz];
  return normalizeNormal(normal);
};
