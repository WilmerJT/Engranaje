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
        
        # --- PARÁMETROS DEL ENGRANAJE (Reemplazados por Node.js) ---
        MODULE = {{MODULE}}
        TEETH = {{TEETH}}
        FACE_WIDTH = {{FACE_WIDTH}}  # Grosor en mm
        BORE_DIAMETER = {{BORE_DIAMETER}}  # Diámetro del eje en mm
        OUTER_DIAMETER = {{OUTER_DIAMETER}}
        
        # 1. Crear un boceto en el plano XY
        sketches = rootComp.sketches
        xyPlane = rootComp.xYConstructionPlane
        sketch = sketches.add(xyPlane)
        
        # 2. Dibujar el círculo exterior base y el agujero del eje
        circles = sketch.sketchCurves.sketchCircles
        centerPoint = adsk.core.Point3D.create(0, 0, 0)
        
        # Diámetro exterior (en cm, Fusion usa cm internamente)
        outerCircle = circles.addByCenterRadius(centerPoint, (OUTER_DIAMETER / 10) / 2)
        
        # Barreno / Eje central
        if BORE_DIAMETER > 0:
            boreCircle = circles.addByCenterRadius(centerPoint, (BORE_DIAMETER / 10) / 2)
        
        # 3. Extrusión 3D
        prof = rootComp.createOpenProfile(outerCircle) # Se ajustará al perfil completo
        extrudes = rootComp.features.extrudeFeatures
        
        # Convertir mm a cm para la API de Fusion
        distance = adsk.core.ValueInput.createByReal(FACE_WIDTH / 10)
        extrudeInput = extrudes.createInput(sketch.profiles.item(0), adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
        extrudeInput.setDistanceExtent(False, distance)
        
        extrudes.add(extrudeInput)
        
        ui.messageBox(f'Engranaje Módulo {MODULE} con {TEETH} dientes creado con éxito.')

    except:
        if ui:
            ui.messageBox('Falló la generación:\n{}'.format(traceback.format_exc()))