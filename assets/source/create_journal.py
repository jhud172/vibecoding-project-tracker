"""Original Relay journal. Blender 4.5 LTS; no downloaded models or textures.
Run: blender --background --factory-startup --python assets/source/create_journal.py
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "models"
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metallic=0, roughness=.5):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return m

forest = material('Forest green cloth', (.035, .115, .075), .12, .48)
edge = material('Spine and binding', (.022, .061, .041), .05, .6)
gold = material('Brushed champagne foil', (.72, .49, .19), .72, .29)
paper = material('Warm ivory paper', (.92, .86, .69), 0, .85)
paper_edge = material('Cut paper edges', (.73, .65, .47), 0, .8)
ink = material('Forest ink', (.045, .10, .068), 0, .85)
ribbon = material('Ochre bookmark ribbon', (.68, .29, .075), .05, .65)

def box(name, loc, size, mat, parent=None, bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new('Rounded crafted edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier=mod.name)
        o.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
    o.data.materials.append(mat)
    if parent:
        o.parent = parent
    return o

def text(name, value, loc, size, mat, parent=None):
    bpy.ops.object.text_add(location=loc)
    o = bpy.context.object
    o.name = name
    o.data.body = value
    o.data.size = size
    o.data.align_x = 'CENTER'
    o.data.extrude = .0015
    o.data.resolution_u = 4
    o.data.materials.append(mat)
    bpy.ops.object.convert(target='MESH')
    if parent:
        o.parent = parent
    return o

def empty(name, loc):
    o = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(o)
    o.location = loc
    return o

box('Hardcover back', (0, 0, .02), (2.24, 3.04, .11), forest, bevel=.065)
box('Rounded spine', (-1.10, 0, .185), (.13, 3.04, .40), edge, bevel=.055)
for y in [-1.22, -.96, .96, 1.22]:
    box('Spine foil band', (-1.175, y, .19), (.012, .045, .26), gold, bevel=.005)
box('Bound page block', (.03, 0, .21), (2.08, 2.87, .25), paper_edge, bevel=.025)
for i in range(9):
    z = .093 + i * .028
    box(f'Visible page edge {i:02}', (.045, -.002, z), (2.075, 2.875, .008), paper, bevel=.005)
box('Right page', (.03, 0, .342), (2.075, 2.87, .012), paper, bevel=.01)
text('Page heading', 'YOUR NEXT', (.10, .85, .353), .115, ink)
text('Page chapter', 'chapter.', (.10, .60, .353), .25, ink)
for i, width in enumerate([1.32, 1.52, 1.07, 1.44, 1.25, 1.50, .92]):
    box('Printed context line', (.03 - (1.52 - width)/2, .23-i*.18, .353), (width,.012,.003), ink, bevel=.001)
box('Bookmark ribbon', (.72, -.22, .365), (.11, 3.12, .008), ribbon, bevel=.007)
text('Page folio', '01', (.05, -1.19, .354), .09, ink)

hinge = empty('Cover hinge', (-1.11, 0, .385))
box('Front cover', (1.11, 0, 0), (2.24, 3.04, .11), forest, hinge, .065)
for x in [.16, 2.06]:
    box('Foil frame vertical', (x, 0, .058), (.013, 2.64, .004), gold, hinge, .003)
for y in [-1.32, 1.32]:
    box('Foil frame horizontal', (1.11, y, .058), (1.9, .013, .004), gold, hinge, .003)
text('Relay embossed wordmark', 'relay.', (1.11, .13, .062), .49, gold, hinge)
text('Cover imprint', 'KEEP THE CONTEXT', (1.11, -.22, .062), .075, paper, hinge)
text('Cover edition', 'THE PROJECT JOURNAL', (1.11, -1.04, .062), .060, gold, hinge)
# Original linked-square emblem, built from small beveled gold rails.
for cx, cy in [(1.0,.82),(1.24,.61)]:
    for dx in [-.08,.08]:
        box('Relay emblem upright',(cx+dx,cy,.063),(.013,.17,.005),gold,hinge,.003)
    for dy in [-.08,.08]:
        box('Relay emblem rail',(cx,cy+dy,.063),(.17,.013,.005),gold,hinge,.003)
box('Relay emblem connector',(1.12,.72,.063),(.015,.18,.005),gold,hinge,.003)

def animate_rotation(obj, frames):
    for frame, angle in frames:
        obj.rotation_euler[1] = math.radians(angle)
        obj.keyframe_insert(data_path='rotation_euler', frame=frame)

animate_rotation(hinge, [(1,0),(10,-5),(30,-90),(63,-169),(90,-170)])
for i in range(4):
    pivot = empty(f'Page turn hinge {i+1}', (-1.04,0,.355+i*.006))
    verts = []
    width = 2.07
    for j in range(17):
        x = width*j/16
        z = .055*math.sin(math.pi*j/16)
        verts.extend([(x,-1.425,z),(x,1.425,z)])
    faces=[(j*2,j*2+2,j*2+3,j*2+1) for j in range(16)]
    mesh=bpy.data.meshes.new(f'Curved sheet mesh {i}')
    mesh.from_pydata(verts,[],faces)
    mesh.materials.append(paper)
    sheet=bpy.data.objects.new(f'Curved turning page {i+1}',mesh)
    bpy.context.collection.objects.link(sheet)
    sheet.parent=pivot
    for polygon in mesh.polygons:
        polygon.use_smooth=True
    mod=sheet.modifiers.new('Paper thickness','SOLIDIFY')
    mod.thickness=.003
    bpy.context.view_layer.objects.active=sheet
    bpy.ops.object.modifier_apply(modifier=mod.name)
    start=19+i*10
    animate_rotation(pivot,[(1,0),(start,0),(start+12,-77),(start+26,-167+i*1.5),(90,-168+i*1.5)])

scene=bpy.context.scene
scene.name='OpenJournal'
scene.frame_start=1
scene.frame_end=90
scene.render.fps=30
scene.frame_set(1)
# Scene mode merges all cover/page object actions into a single seekable clip.
bpy.ops.export_scene.gltf(filepath=str(OUT/'relay-journal.glb'),export_format='GLB',
    export_animations=True,export_animation_mode='SCENE',export_anim_scene_split_object=False,
    export_force_sampling=True,export_frame_range=True,export_cameras=False,export_lights=False,
    export_extras=True)

# A real Blender-rendered fallback uses exactly the same model and materials.
scene.frame_set(90)
scene.render.engine='BLENDER_EEVEE_NEXT'
scene.render.resolution_x=720
scene.render.resolution_y=520
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format='WEBP'
scene.render.image_settings.quality=88
scene.render.filepath=str(OUT/'relay-journal-poster.webp')
scene.world.color=(.35,.35,.35)
bpy.ops.object.camera_add(location=(3.7,-5.6,6.7))
camera=bpy.context.object
camera.name='Poster camera'
direction=Vector((-.5,0,.1))-camera.location
camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=7.0
scene.camera=camera
for name,loc,power,size in [('Warm key',(-3,-4,7),700,5),('Soft fill',(4,1,5),500,4),('Foil rim',(-2,4,5),850,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    light=bpy.context.object
    light.name=name
    light.data.energy=power
    light.data.shape='DISK'
    light.data.size=size
    light.rotation_euler=(Vector((-.5,0,0))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets'/'source'/'relay-journal.blend'))
bpy.ops.render.render(write_still=True)
print('RELAY_MODEL_COMPLETE', (OUT/'relay-journal.glb').stat().st_size)
