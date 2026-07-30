# Script generado automáticamente para Autodesk Fusion 360
import adsk.core, adsk.fusion, traceback

def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui  = app.userInterface
        doc = app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
        design = app.activeProduct
        
        # Obtener el componente raíz
        rootComp = design.rootComponent
        
        # --- PARÁMETROS DEL ENGRANAJE (Inyectados por Node.js) ---
        MODULE = undefined
        TEETH = 20
        FACE_WIDTH = 12
        BORE_DIAMETER = 10
        OUTER_DIAMETER = 44
        KEYWAY_WIDTH = 2.5
        KEYWAY_DEPTH = 1.5
        
        # 1. Crear boceto en el plano XY
        sketches = rootComp.sketches
        xyPlane = rootComp.xYConstructionPlane
        sketch = sketches.add(xyPlane)

        circles = sketch.sketchCurves.sketchCircles
        lines = sketch.sketchCurves.sketchLines
        centerPoint = adsk.core.Point3D.create(0, 0, 0)

        # Diámetro exterior (convertido de mm a cm)
        outerCircle = circles.addByCenterRadius(centerPoint, (OUTER_DIAMETER / 10) / 2)

        # 2. Si se especificó un eje / barreno
        if BORE_DIAMETER > 0:
            boreRadius = (BORE_DIAMETER / 10) / 2
            boreCircle = circles.addByCenterRadius(centerPoint, boreRadius)
            
            # Dibujar Chavetero si existen dimensiones
            if KEYWAY_WIDTH > 0 and KEYWAY_DEPTH > 0:
                kw = (KEYWAY_WIDTH / 10) / 2  # Mitad del ancho en cm
                kd = KEYWAY_DEPTH / 10        # Profundidad en cm
                
                # Puntos del rectángulo del cuñero en el borde superior del barreno
                p1 = adsk.core.Point3D.create(-kw, boreRadius, 0)
                p2 = adsk.core.Point3D.create(-kw, boreRadius + kd, 0)
                p3 = adsk.core.Point3D.create(kw, boreRadius + kd, 0)
                p4 = adsk.core.Point3D.create(kw, boreRadius, 0)
                
                lines.addByTwoPoints(p1, p2)
                lines.addByTwoPoints(p2, p3)
                lines.addByTwoPoints(p3, p4)

        # 3. Extrusión 3D
        extrudes = rootComp.features.extrudeFeatures
        
        # Tomar el primer perfil cerrado resultante del boceto
        profile = sketch.profiles.item(0)
        
        # Convertir mm a cm para la profundidad de la extrusión
        distance = adsk.core.ValueInput.createByReal(FACE_WIDTH / 10)
        
        extrudeInput = extrudes.createInput(profile, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
        extrudeInput.setDistanceExtent(False, distance)
        
        extrudes.add(extrudeInput)
        
        ui.messageBox(f'Engranaje Módulo {MODULE} con {TEETH} dientes creado con éxito.')

    except:
        if ui:
            ui.messageBox('Falló la generación:\n{}'.format(traceback.format_exc()))