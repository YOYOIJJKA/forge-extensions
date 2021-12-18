/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var viewer;
var fileName;

function launchViewer(urn, name) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  fileName = name;

  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'), { extensions: ['HandleSelectionExtension', 'Autodesk.Viewing.SceneBuilder']});
    viewer.start();
    viewer.loadExtension('Autodesk.Viewing.SceneBuilder');
    var modelID = 'urn:' + urn;

    // var geometry = new THREE.SphereGeometry (10,10,10)
    // var color = new THREE.MechBasicMaterial ({color:0x7FFF00})
    // sphereMesh = new THREE.Mesh(geometry, color)
    // viewer.overlays.addScene('custom-scene')
    // viewer.overlays.addMesh (sphereMesh, 'custom-scene')

    Autodesk.Viewing.Document.load(modelID, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry();
  viewer.loadDocumentNode(doc, viewables).then(i => {
    // documented loaded, any action?
    var ViewerInstance = new CustomEvent("viewerinstance", {detail: {viewer: viewer}});      
      document.dispatchEvent(ViewerInstance);
      // var LoadExtensionEvent = new CustomEvent("loadextension", {
      //   detail: {
      //     extension: "Extension1",
      //     viewer: viewer
      //   }
      // });      
      // document.dispatchEvent(LoadExtensionEvent);
  });
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);

}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}

async function addViewable(urn, /*xform,*/ offset) {
  return new Promise(function (resolve, reject) {
      function onDocumentLoadSuccessAdd(doc) {
          const viewable = doc.getRoot().getDefaultGeometry();
          const options = {
              preserveView: true,
              keepCurrentModels: true
          };
          // if (xform) {
          //     options.placementTransform= xform;
          // }
          if (offset) {
              options.globalOffset = offset;
          }
          viewer.loadDocumentNode(doc, viewable, options)
              .then(resolve)
              .catch(reject);
      }
      Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccessAdd, onDocumentLoadFailure);
  });
}

async function createField() 
{
ext = viewer.getExtension('Autodesk.Viewing.SceneBuilder');

modelBuilder = await ext.addNewModel({
conserveMemory: false,
modelNameOverride: 'My Model Name' //название модели
});

// пример построения box из материала purple
purple = new THREE.MeshPhongMaterial({ //материал создаваемой модели
color: new THREE.Color(1, 0, 1)
});
modelBuilder.addMaterial('purple', purple);

box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(10, 10, 10));
let id = modelBuilder.addGeometry(box);

const transform = new THREE.Matrix4().compose( //геометрия модели
new THREE.Vector3(-15, 0, 0),
new THREE.Quaternion(0, 0, 0, 1),
new THREE.Vector3(1, 1, 1)
);
modelBuilder.addFragment(1, 'purple', transform); //метод возвращает id фрагмента

// пример построения torus из материала red
red = new THREE.MeshPhongMaterial({
color: new THREE.Color(1, 0, 0)
});
torus = new THREE.BufferGeometry().fromGeometry(new THREE.TorusGeometry(10, 2, 32, 32));

const transform1 = new THREE.Matrix4().compose(
new THREE.Vector3(19, 0, 0),
new THREE.Quaternion(0, 0, 0, 1),
new THREE.Vector3(1, 1, 1)
);
modelBuilder.addFragment(torus, red, transform1);

// пример построения двух геометрий с помощью сетки
mesh = new THREE.Mesh(torus, purple);
mesh.matrix = new THREE.Matrix4().compose(
new THREE.Vector3(0, 12, 12),
new THREE.Quaternion(0, 0, 0, 1),
new THREE.Vector3(1, 1, 1)
);
mesh.dbId = 100; // Set the database id for the mesh
modelBuilder.addMesh(mesh);

}