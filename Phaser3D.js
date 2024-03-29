class Phaser3D extends Phaser.Events.EventEmitter
{
    constructor (phaserScene, { ortho = false, fov = 75, aspect = null, near = 0.1, far = 1000, left = -1, right = 1, top = 1, bottom = -1, x = 0, y = 0, z = 0, anisotropy = 1 } = {})
    {
        super();

        this.root = phaserScene;

        this.view = phaserScene.add.extern();

        this.scene = new THREE.Scene();

        this.textureAnisotropy = anisotropy;

        if (!aspect)
        {
            aspect = phaserScene.scale.gameSize.aspectRatio;
        }

        if (ortho)
        {
            this.addOrthoCamera({ left, right, top, bottom, near, far, x, y, z });
        }
        else
        {
            this.addPerspectiveCamera({ fov, aspect, near, far, x, y, z });
        }
        
        

        // Load the background texture
        var texture = THREE.ImageUtils.loadTexture( 'img/bg_por.png' );
        var backgroundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2, 0),
            new THREE.MeshBasicMaterial({
                map: texture
            }));

        backgroundMesh .material.depthTest = false;
        backgroundMesh .material.depthWrite = false;

        // Create your background scene
        var backgroundScene = new THREE.Scene();
        var backgroundCamera = new THREE.Camera();
        backgroundScene.add(backgroundCamera );
        backgroundScene.add(backgroundMesh );

        
        
        //  This is handy if you want to capture camera position for your code while using the orbit controls:

        // window._cam = this.camera;

        // window.cam = function ()
        // {
        //     console.log('x: ' + _cam.position.x.toFixed(2) + ', y: ' + _cam.position.y.toFixed(2) + ', z: ' + _cam.position.z.toFixed(2));
        //     console.log('phaser3d.camera.rotation.set(' + _cam.rotation.x.toFixed(2) + ', ' + _cam.rotation.y.toFixed(2) + ', ' + _cam.rotation.z.toFixed(2) + ');');
        // };

        this.renderer = new THREE.WebGLRenderer({
            canvas: phaserScene.sys.game.canvas,
            context: phaserScene.sys.game.context,
            antialias: true
        });

        this.composer = null;

        //  We don't want three.js to wipe our gl context!
        this.renderer.autoClear = false;
        //  Create our Extern render callback
        this.view.render = () => {

            //  This is important to retain GL state between renders
            this.renderer.state.reset();
            this.renderer.render(backgroundScene , backgroundCamera );
            this.renderer.render(this.scene, this.camera);

        };
        


        //  Some basic factory helpers
        this.add = {

            //  Lights
            ambientLight: (config) => this.addAmbientLight(config),
            directionalLight: (config) => this.addDirectionalLight(config),
            hemisphereLight: (config) => this.addHemisphereLight(config),
            pointLight: (config) => this.addPointLight(config),
            spotLight: (config) => this.addSpotLight(config),

            effectComposer: () => this.addEffectComposer(),
            mesh: (mesh) => this.addMesh(mesh),
            group: (...children) => this.addGroup(children),

            //  Geometry
            ground: (config) => this.addGround(config),
            box: (config) => this.addBox(config),
            cone: (config) => this.addCone(config),
            circle: (config) => this.addCircle(config),
            cylinder: (config) => this.addCylinder(config),
            dodecahedron: (config) => this.addDodecahedron(config),
            extrude: (config) => this.addExtrude(config),
            lathe: (config) => this.addLathe(config),
            icosahedron: (config) => this.addIcosahedron(config),
            plane: (config) => this.addPlane(config),
            parametric: (config) => this.addParametric(config),
            ring: (config) => this.addRing(config),
            sphere: (config) => this.addSphere(config),
            text: (config) => this.addText(config),
            tube: (config) => this.addTube(config),
            octahedron: (config) => this.addOctahedron(config),
            polyhedron: (config) => this.addPolyhedron(config),
            shape: (config) => this.addShape(config),
            tetrahedron: (config) => this.addTetrahedron(config),
            torus: (config) => this.addTorus(config),
            torusKnot: (config) => this.addTorusKnot(config),
           boxRoundedCorner: (config) => this.addRoundCornerBox(config),
        };

        //  Some basic factory helpers
        this.make = {
            box: (config) => this.makeBox(config),
            cone: (config) => this.makeCone(config),
            circle: (config) => this.makeCircle(config),
            cylinder: (config) => this.makeCylinder(config),
            dodecahedron: (config) => this.makeDodecahedron(config),
            extrude: (config) => this.makeExtrude(config),
            icosahedron: (config) => this.makeIcosahedron(config),
            lathe: (config) => this.makeLathe(config),
            plane: (config) => this.makePlane(config),
            parametric: (config) => this.makeParametric(config),
            ring: (config) => this.makeRing(config),
            sphere: (config) => this.makeSphere(config),
            shape: (config) => this.makeShape(config),
            text: (config) => this.makeText(config),
            tube: (config) => this.makeTube(config),
            octahedron: (config) => this.makeOctahedron(config),
            polyhedron: (config) => this.makePolyhedron(config),
            tetrahedron: (config) => this.makeTetrahedron(config),
            torus: (config) => this.makeTorus(config),
            torusKnot: (config) => this.makeTorusKnot(config),
        };
    }

    addEffectComposer ()
    {
        this.composer = new THREE.EffectComposer(this.renderer);

        this.view.render = () => {

            //  This is important to retain GL state between renders
            this.renderer.state.reset();

            this.composer.render();

        };

        return this.composer;
    }

    enableFog (color = 0x000000, near = 1, far = 1000)
    {
        this.scene.fog = new THREE.Fog(color, near, far);

        return this;
    }

    enableFogExp2 (color = 0x000000, density = 0.00025)
    {
        this.scene.fog = new THREE.FogExp2(color, density);

        return this;
    }

    enableGamma (input = true, output = true)
    {
        this.renderer.gammaInput = input;
        this.renderer.gammaOutput = output;

        return this;
    }

    enableShadows (type = THREE.PCFShadowMap)
    {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = type;

        return this;
    }

    setCubeBackground (...files)
    {
        this.scene.background = this.createCubeTexture(...files)

        return this;
    }

    //  three.js uses a right-handed coordinate system!
    //  So cubemaps found on the web likely need their nx/px swapped and ny = rotate 90 deg clockwise and py = rotate 90 deg counter clockwise
    createCubeTexture (path, right = 'px.png', left = 'nx.png', up = 'py.png', down = 'ny.png', back = 'pz.png', front = 'nz.png')
    {
        if (path.substr(-1) !== '/')
        {
            path = path.concat('/');
        }

         return new THREE.CubeTextureLoader().setPath(path).load([right, left, up, down, back, front]);
    }

    castShadow (...meshes)
    {
        for (const mesh of meshes.values())
        {
            mesh.castShadow = true;
        }

        return this;
    }

    receiveShadow (...meshes)
    {
        for (const mesh of meshes.values())
        {
            mesh.receiveShadow = true;
        }

        return this;
    }

    setShadow (light, width = 512, height = 512, near = 1, far = 1000)
    {
        light.castShadow = true;

        light.shadow.mapSize.width = width;
        light.shadow.mapSize.height = height;

        light.shadow.camera.near = near;
        light.shadow.camera.far = far;

        return light;
    }

    addGLTFModel (key, resourcePath, onLoad)
    {
        const data = this.root.cache.binary.get(key);

        const loader = new THREE.GLTFLoader();

        loader.parse(data, resourcePath, (gltf) => {

            const model = gltf.scene.children[0];

            this.scene.add(model);

            this.emit('loadgltf', gltf, model);

            if (onLoad)
            {
                onLoad(gltf, model);
            }

        });
    }

    parseGLTFModel (key, resourcePath, onLoad)
    {
        const data = this.root.cache.binary.get(key);

        const loader = new THREE.GLTFLoader();

        loader.parse(data, resourcePath, (gltf) => {

            this.emit('loadgltf', gltf);

            if (onLoad)
            {
                onLoad(gltf);
            }

        });
    }

    getTexture (key)
    {
        let texture = new THREE.Texture();
        
        texture.image = this.root.textures.get(key).getSourceImage();

        texture.format = THREE.RGBAFormat;
        texture.needsUpdate = true;
        texture.anisotropy = this.textureAnisotropy;

        return texture;
    }

    addHemisphereLight ({ skyColor = 0xffffff, groundColor = 0x000000, intensity = 1 } = {})
    {
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);

        this.scene.add(light);

        return light;
    }

    addAmbientLight ({ color = 0xffffff, intensity = 1 } = {})
    {
        const light = new THREE.AmbientLight(color, intensity);

        this.scene.add(light);

        return light;
    }

    addDirectionalLight ({ color = 0xffffff, intensity = 1, x = 0, y = 0, z = 0 } = {})
    {
        const light = new THREE.DirectionalLight(color, intensity);

        light.position.set(x, y, z);

        this.scene.add(light);

        return light;
    }

    addPointLight ({ color = 0xffffff, intensity = 1, distance = 0, decay = 1, x = 0, y = 0, z = 0 } = {})
    {
        const light = new THREE.PointLight(color, intensity, distance, decay);

        light.position.set(x, y, z);

        this.scene.add(light);

        return light;
    }

    addSpotLight ({ color = 0xffffff, intensity = 1, distance = 0, angle = Math.PI / 4, penumbra = 0.05, decay = 1, x = 0, y = 0, z = 0 } = {})
    {
        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);

        light.position.set(x, y, z);

        this.scene.add(light);

        return light;
    }

    addOrthoCamera ({ left = -1, right = 1, top = 1, bottom = -1, near = 0, far = 1, x = 0, y = 0, z = 0 })
    {
        this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);

        this.camera.position.set(x, y, z);

        return this;
    }

    addPerspectiveCamera ({ fov = 75, aspect = null, near = 0.1, far = 1000, x = 0, y = 0, z = 0 })
    {
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

        this.camera.position.set(x, y, z);

        return this;
    }

    addGroup (children)
    {
        const group = new THREE.Group();

        if (Array.isArray(children))
        {
            for (let i = 0; i < children.length; i++)
            {
                group.add(children[i]);
            }
        }

        this.scene.add(group);

        return group
    }

    addMesh (mesh)
    {
        if (Array.isArray(mesh))
        {
            for (let i = 0; i < mesh.length; i++)
            {
                this.scene.add(mesh[i]);
            }
        }
        else
        {
            this.scene.add(mesh);
        }


        return this;
    }

    createTexture ({ key, wrap, wrapS = THREE.ClampToEdgeWrapping, wrapT = THREE.ClampToEdgeWrapping, alpha = true, repeatX = 1, repeatY = 1 } = {})
    {
        const texture = this.getTexture(key);

        if (wrap)
        {
            wrapS = wrap;
            wrapT = wrap;
        }

        texture.wrapS = wrapS;
        texture.wrapT = wrapT;
        texture.repeat.set(repeatX, repeatY);
        texture.premultiplyAlpha = alpha;

        return texture;
    }

    createShaderMaterial (uniforms, key, params)
    {
        let config = { ...params };

        let shader = this.root.cache.shader.get(key);

        config.uniforms = uniforms;
        config.vertexShader = shader.vertexSrc;
        config.fragmentShader = shader.fragmentSrc;

        return new THREE.ShaderMaterial(config);
    }

    createMaterial (texture, color, material)
    {
        if (material && !Phaser.Utils.Objects.IsPlainObject(material))
        {
            return material;
        }
        else
        {
            if (material === null)
            {
                material = {};
            }

            let config = { ...material };

            if (texture)
            {
                config.map = (typeof(texture) === 'string') ? this.getTexture(texture) : texture;
            }

            if (color)
            {
                config.color = color;
            }

            const isBasic = config.basic;
            const isPhong = config.phong;
            const isLine = config.line;
            const isPoints = config.points;

            delete config.basic;
            delete config.phong;
            delete config.line;
            delete config.points;

            if (isBasic)
            {
                return new THREE.MeshBasicMaterial(config);
            }
            else if (isPhong)
            {
                return new THREE.MeshPhongMaterial(config);
            }
            else if (isLine)
            {
                return new THREE.LineBasicMaterial(config);
            }
            else if (isPoints)
            {
                return new THREE.PointsMaterial(config);
            }
            else
            {
                return new THREE.MeshStandardMaterial(config);
            }
        }
    }

    createMesh (geometry, material, x = 0, y = 0, z = 0)
    {
        let obj = new THREE.Mesh(geometry, material);

        obj.position.set(x, y, z);

        return obj;
    }

    makeText ({ text = '', font = '', size = 100, height = 50, curveSegments = 12, bevelEnabled = false, bevelThickness = 10, bevelSize = 8, bevelSegments = 3, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        font = new THREE.Font(this.root.sys.cache.json.get(font));

        const geometry = new THREE.TextBufferGeometry(text, { font, size, height, curveSegments, bevelEnabled, bevelThickness, bevelSize, bevelSegments });

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addText (config)
    {
        const obj = this.makeText(config);

        this.scene.add(obj);

        return obj;
    }

    makeCircle ({ radius = 1, segments = 8, thetaStart = 0, thetaLength = Math.PI * 2, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        
        const geometry = new THREE.CircleBufferGeometry(radius, segments, thetaStart, thetaLength);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addCircle (config)
    {
        const obj = this.makeCircle(config);

        this.scene.add(obj);

        return obj;
    }

    makeRing ({ innerRadius = 0.5, outerRadius = 1, thetaSegments = 8, phiSegments = 1, thetaStart = 0, thetaLength = Math.PI * 2, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.RingBufferGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addRing (config)
    {
        const obj = this.makeRing(config);

        this.scene.add(obj);

        return obj;
    }

    makeExtrude ({ shapes, options, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.ExtrudeBufferGeometry(shapes, options);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addExtrude (config)
    {
        const obj = this.makeExtrude(config);

        this.scene.add(obj);

        return obj;
    }

    makeShape ({ shapes, curveSegments = 12, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.ShapeBufferGeometry(shapes, curveSegments);
        
        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addShape (config)
    {
        const obj = this.makeShape(config);

        this.scene.add(obj);

        return obj;
    }

    makeLathe ({ points, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.LatheBufferGeometry(points);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addLathe (config)
    {
        const obj = this.makeLathe(config);

        this.scene.add(obj);

        return obj;
    }

    makeTube ({ path, tubularSegments = 64, radius = 1, radialSegments = 8, closed = false, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.TubeBufferGeometry(path, tubularSegments, radius, radialSegments, closed);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addTube (config)
    {
        const obj = this.makeTube(config);

        this.scene.add(obj);

        return obj;
    }

    makeParametric ({ func, slices, stacks, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.ParametricBufferGeometry(func, slices, stacks);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addParametric (config)
    {
        const obj = this.makeParametric(config);

        this.scene.add(obj);

        return obj;
    }

    makeTorus ({ radius = 1, tube = 0.4, radialSegments = 8, tubularSegments = 6, arc = Math.PI * 2, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.TorusBufferGeometry(radius, tube, radialSegments, tubularSegments, arc);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addTorus (config)
    {
        const obj = this.makeTorus(config);

        this.scene.add(obj);

        return obj;
    }

    makePolyhedron ({ vertices = [], indices = [], radius = 6, detail = 2, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.PolyhedronBufferGeometry(vertices, indices, radius, detail);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addPolyhedron (config)
    {
        const obj = this.makePolyhedron(config);

        this.scene.add(obj);

        return obj;
    }

    makeOctahedron ({ radius = 1, detail = 0, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.OctahedronBufferGeometry(radius, detail);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addOctahedron (config)
    {
        const obj = this.makeOctahedron(config);

        this.scene.add(obj);

        return obj;
    }

    makeIcosahedron ({ radius = 1, detail = 0, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.IcosahedronBufferGeometry(radius, detail);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addIcosahedron (config)
    {
        const obj = this.makeIcosahedron(config);

        this.scene.add(obj);

        return obj;
    }

    makeTetrahedron ({ radius = 1, detail = 0, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.TetrahedronBufferGeometry(radius, detail);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addTetrahedron (config)
    {
        const obj = this.makeTetrahedron(config);

        this.scene.add(obj);

        return obj;
    }

    makeTorusKnot ({ radius = 1, tube = 0.4, tubularSegments = 64, radialSegments = 8, p = 2, q = 3, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.TorusKnotBufferGeometry(radius, tube, tubularSegments, radialSegments, p, q);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addTorusKnot (config)
    {
        const obj = this.makeTorusKnot(config);

        this.scene.add(obj);

        return obj;
    }

    makePlane ({ width = 1, height = 1, widthSegments = 1, heightSegments = 1, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        widthSegments = 1; heightSegments = 1;
        const geometry = new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
        texture = new THREE.TextureLoader().load('pearl_ball.png');
        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addPlane (config)
    {
        const obj = this.makePlane(config);

        this.scene.add(obj);

        return obj;
    }

    makePoints ({ geometry = null, texture = null, color = 0xffffff, material = null } = {})
    {
        return new THREE.Points(geometry, this.createMaterial(texture, color, material));
    }

    addPoints (config)
    {
        const obj = this.makePoints(config);

        this.scene.add(obj);

        return obj;
    }

    addGround ({ receiveShadow = false, texture = null, color = 0xffffff, material = null } = {})
    {
        
        const plane = this.makePlane({ width: 2000, height: 2000, texture, color, material });

        plane.rotation.x = -Math.PI * 0.5;

        plane.receiveShadow = receiveShadow;

        this.scene.add(plane);

        return plane;
    }

    makeSphere ({ radius = 1, widthSegments = 10, heightSegments = 10, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        
        texture = new THREE.TextureLoader().load('pink.png');

        
        material = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
        /*material = new THREE.MeshStandardMaterial({
            color: 0xffebff,
            metalness: 1,
            emissive: 0x2a0000,
            shininess: 5,
            specular: 0xffffff});*/
        `material = new THREE.MeshStandardMaterial({
            color: 0xffebff,
            roughness: 0.5,
            metalness: 1,
            aoMapIntensity: 1, 
            ambientIntensity: 0.2,
            envMapIntensity: 1,
            displacementScale: 2.4,
            normalScale: 1,
        });`

        /*material = new THREE.MeshPhongMaterial( {
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true
        } )*/
        material = new THREE.MeshPhongMaterial( {
            
            color: 0x800080,
            emissive: 0xffb3ff,
            side: THREE.DoubleSide,
            flatShading: true,
            roughness: 0.5,
            metalness: 1,
            aoMapIntensity: 1, 
            ambientIntensity: 0.2,
            envMapIntensity: 1,
            displacementScale: 2.4,
            normalScale: 1,
        } )

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        //color = 0x000000;
        
        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
        
        
    }

    addSphere (config)
    {
        const obj = this.makeSphere(config);
        /*const obj = new THREE.Mesh(
			new THREE.SphereGeometry(2.5, 50, 50),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('globe.png'),
				bumpMap:     THREE.ImageUtils.loadTexture('globe.png'),
				bumpScale:   0.05,
				specularMap: THREE.ImageUtils.loadTexture('globe.png'),
                specular:    new THREE.Color('grey')	
                							
            })
        
        );
        obj.position.set(0, 0, 0);*/
        this.scene.add(obj);

        return obj;
    }

    makeCone ({ radius = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.ConeBufferGeometry(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addCone (config)
    {
        const obj = this.makeCone(config);

        this.scene.add(obj);

        return obj;
    }

    makeCylinder ({ radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        
        const geometry = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
        texture = new THREE.TextureLoader().load('tube.png');
        //material = new THREE.MeshBasicMaterial({map : texture, overdraw: 0.1});
        var materials = [
            new THREE.MeshStandardMaterial({color: 0xffffff}),
          new THREE.MeshBasicMaterial({color: 0xffffff}),
          new THREE.MeshLambertMaterial({color: 0xffffff}),//Top
          new THREE.MeshNormalMaterial({color: 0xffffff}),
          new THREE.MeshPhongMaterial({color: 0xffffff}),
          new THREE.MeshBasicMaterial({color: 0xffffff})
        ];

        this.mesh = new THREE.Mesh( this.geometry, this.materials );
        return this.createMesh(geometry, this.createMaterial(texture, color, materials), x, y, z);
    }

    addCylinder (config)
    {
        const obj = this.makeCylinder(config);

        this.scene.add(obj);

        return obj;
    }

    makeDodecahedron ({ radius = 1, detail = 0, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {})
    {
        const geometry = new THREE.DodecahedronBufferGeometry(radius, detail);

        return this.createMesh(geometry, this.createMaterial(texture, color, material), x, y, z);
    }

    addDodecahedron (config)
    {
        const obj = this.makeDodecahedron(config);

        this.scene.add(obj);

        return obj;
    }

    makeBox ({ size = null, width = 1, height = 1, depth = 1, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0, textrueValue } = {})
    {
        if (size)
        {
            width = size;
            height = size;
            depth = size;
        }

        //var RoundedBoxGeometry = require('three-rounded-box')(THREE); //pass your instance of three

        //var myBox = new THREE.Mesh( new RoundedBoxGeometry( 10 , 10 , 10 , 2 , 5 ) );

        const geometry = new THREE.BoxBufferGeometry(width, height, depth);
        //const geometry = new RoundedBoxGeometry(width, height, depth, 2, 5);
        if(textrueValue >= 13) {
            texture = new THREE.TextureLoader().load('/img/nivea_column_texture.jpeg');
        }
            
        else if (textrueValue >= 10 && textrueValue < 13){
            texture = new THREE.TextureLoader().load('/img/blue_column_texture.jpeg');
        }
            
        else if(textrueValue < 10 && textrueValue >= 7) {
            texture = new THREE.TextureLoader().load('/img/nivea_go_column_texture.jpeg')
        }
        
        console.log(textrueValue);
        
        //var frontTexture = textrueValue < 7 ? new THREE.MeshStandardMaterial({color: 0xffffff}) : new THREE.MeshStandardMaterial({map: texture});
        
        
        //material = new THREE.MeshBasicMaterial({map : texture, overdraw: 0.1});
        var materials = [
            new THREE.MeshStandardMaterial({color: 0xffffff}),
          new THREE.MeshBasicMaterial({color: 0xffffff}),
          //new THREE.MeshLambertMaterial({map: texture}),//Top
          new THREE.MeshBasicMaterial({color: 0xffffff}),
          new THREE.MeshNormalMaterial({color: 0xffffff}),
          
          
          //frontTexture,
          new THREE.MeshPhongMaterial({map: texture}),//Front
          //new THREE.MeshStandardMaterial({color: 0xffffff}),
          new THREE.MeshBasicMaterial({color: 0xffffff})
        ];

        
        this.mesh = new THREE.Mesh( this.geometry, this.materials );

        
        return this.createMesh(geometry, this.createMaterial(texture, color, materials), x, y, z);
    }

    addBox (config)
    {
        const obj = this.makeBox(config);

        this.scene.add(obj);

        return obj;
    }
    //{ size = null, width = 1, height = 1, depth = 1, texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {}
    //w, h, d, r, wSegs, hSegs, dSegs, rSegs
    createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
        
        let shape = new THREE.Shape();
        let eps = 0.00001;
        let radius = radius0 - eps;
        shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
        shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
        shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
        shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
        let geometry = new THREE.ExtrudeBufferGeometry( shape, {
          depth: depth - radius0 * 2,
          bevelEnabled: true,
          bevelSegments: smoothness * 2,
          steps: 1,
          bevelSize: radius,
          bevelThickness: radius0,
          curveSegments: smoothness
        });
        
        //geometry.center();
        
        return geometry;
      }
      
      

    makeRoudCournderBox({ size = null, width = 1, height = 1, depth = 1, radius = 0.1, wSegs = 1, hSegs = 1, dSegs = 1, rSegs = 1,
        texture = null, color = 0xffffff, material = null, x = 0, y = 0, z = 0 } = {}) {
        
        var smoothness = 20;

        var textureLoader = new THREE.TextureLoader();
        
        texture = textureLoader.load("https://threejs.org/examples/textures/uv_grid_opengl.jpg");

        material = [
            new THREE.MeshBasicMaterial({ color: 0x1a0dab }),
            new THREE.MeshBasicMaterial({ color: 0x2196f3 }), //blue
            new THREE.MeshBasicMaterial({ color: 0x5f048c }), //violet
            new THREE.MeshBasicMaterial({ color: 0xffeb3b }), //yellow
            new THREE.MeshBasicMaterial({ color: 0x64b448 }), //green
            new THREE.MeshBasicMaterial({ color: 0xff0000 }) //red
        ];
        let cube = new THREE.Mesh( createBoxWithRoundedEdges( 5, 5, 5, .5, 10 ), material );

        //var plane = new THREE.Mesh(planeGeom, materials);
        this.mesh = new THREE.Mesh( this.cube, material );

        
        return this.createMesh(cube, this.createMaterial(texture, color, material), x, y, z);
    }

    addRoundCornerBox (config)
    {
        const obj = this.makeRoundCornerBox(config);

        this.scene.add(obj);
        
    
        return obj;
    }

    
}
