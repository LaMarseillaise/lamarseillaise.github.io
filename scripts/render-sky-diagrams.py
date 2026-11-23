"""Generate the observatory's explanatory SVGs; Python stdlib, no runtime build.

Earths use one orthographic camera and a fixed 23.44-degree axis. Lighting is
the projected intersection of the visible hemisphere and sunward hemisphere.
Sizes, orbital distances and eclipse shadow widths are deliberately schematic.
"""
from math import sin, cos, pi, sqrt, atan2
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'projects/astrometrics/diagrams'
OUT.mkdir(exist_ok=True)
INK, GOLD, TEAL, DARK = '#edf2f4', '#edc880', '#8bd8cc', '#0b1823'

def svg(name, width, height, title, body):
    (OUT / f'{name}.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title">
<title id="title">{title}</title>
<style>text{{font:16px system-ui,sans-serif;fill:{INK}}}.small{{font-size:13px}}.large{{font-size:24px}}.muted{{fill:#b6c7d1}}</style>
{body}</svg>\n''')

def text(x, y, label, cls='', anchor='middle'):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" class="{cls}">{label}</text>'

def circle(x, y, r, fill, extra=''):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" {extra}/>'

def path(points, extra):
    return '<path d="M' + 'L'.join(f'{x:.3f},{y:.3f}' for x,y in points) + f'" {extra}/>'

def illuminated(x, y, r, toward_camera, angle, fill):
    # u points toward the projected Sun; v lies across it. The terminator is
    # u = -toward_camera * sqrt(1-v²), independent of the sphere's radius.
    vs = [-1 + 2*i/100 for i in range(101)]
    outline = [(sqrt(max(0,1-v*v)),v) for v in vs]
    outline += [(-toward_camera*sqrt(max(0,1-v*v)),v) for v in reversed(vs)]
    pts = [(x+r*(u*cos(angle)-v*sin(angle)), y+r*(u*sin(angle)+v*cos(angle))) for u,v in outline]
    return path(pts + [pts[0]], f'fill="{fill}"')

# Camera looks toward the origin from (0,-sqrt(3)/2,1/2).
# Screen up is (0,1/2,sqrt(3)/2); all orbit and globe projections share it.
tilt = 23.44*pi/180
axis = (sin(tilt), 0, cos(tilt))
def project(v):
    return v[0], -(v[1]/2 + v[2]*sqrt(3)/2)

seasons = [('march', (0,1,0), 'March equinox'),
           ('june', (-1,0,0), 'June solstice'),
           ('september', (0,-1,0), 'September equinox'),
           ('december', (1,0,0), 'December solstice')]
for name, position, title in seasons:
    x,y,r = 100,115,62
    light = tuple(-v for v in position)
    lx,ly = project(light)
    toward_camera = -sqrt(3)/2*light[1] + light[2]/2
    body = circle(x,y,r,DARK) + illuminated(x,y,r,toward_camera,atan2(ly,lx),'#39768c')
    body += circle(x,y,r,'none',f'stroke="{TEAL}" stroke-width="1.5"')
    # Equator: two perpendicular unit basis vectors, both normal to axis.
    # Draw rear segments dashed; front segments continuous, never a fake ellipse.
    for i in range(120):
        pts, depth = [], 0
        for a in [i*2*pi/120, (i+1)*2*pi/120]:
            v = (cos(tilt)*cos(a), sin(a), -sin(tilt)*cos(a))
            u,w = project(v)
            pts.append((x+r*u,y+r*w))
            depth += -sqrt(3)/2*v[1]+v[2]/2
        if depth >= 0 or i % 4 < 2:
            body += path(pts, f'fill="none" stroke="{GOLD}" stroke-width="3" opacity="{1 if depth >= 0 else .5}"')
    ax,ay = project(axis)
    body += path([(x-1.4*r*ax,y-1.4*r*ay),(x+1.4*r*ax,y+1.4*r*ay)],f'stroke="{INK}" stroke-width="1.5" stroke-dasharray="4 4"')
    body += text(x+1.65*r*ax,y+1.65*r*ay+5,'N')
    body += text(100,218,'Gold line = equator','small')
    # Miniature orbit locates the same Earth relative to the Sun.
    body += '<ellipse cx="258" cy="115" rx="55" ry="27.5" fill="none" stroke="#7293a8"/>'
    body += circle(258,115,10,GOLD) + text(258,120,'☉','small')
    for _, p, _ in seasons:
        px,py=project(p)
        body += circle(258+55*px,115+55*py,4,'#7293a8')
    px,py=project(position)
    ex,ey=258+55*px,115+55*py
    body += path([(258,115),(ex,ey)],f'stroke="{GOLD}" stroke-width="1.5"')
    body += circle(ex,ey,7,TEAL)
    body += text(258,180,'Sun → Earth','small')
    body += text(258,199,'Orbit locator','small muted')
    svg(name,340,235,title+': fixed axis, highlighted equator, illuminated hemisphere and orbital location',body)

# Moon orbit from above Earth's north pole. New -> first quarter -> full is
# counterclockwise. At every position the sunward half faces left.
body = '<path d="M68 115H435M68 175H435M68 235H435M68 295H435" stroke="#edc880" opacity=".2" stroke-width="2"/>'
body += circle(34,205,29,GOLD) + text(36,265,'Sun','large')
body += circle(270,205,118,'none','stroke="#7293a8" stroke-dasharray="4 5"')
body += circle(270,205,23,DARK) + illuminated(270,205,23,0,pi,'#39768c')
body += circle(270,205,23,'none',f'stroke="{TEAL}"') + text(270,255,'Earth','large')
for i in range(8):
    a=i*pi/4
    x,y=270-118*cos(a),205+118*sin(a)
    body += circle(x,y,16,DARK) + illuminated(x,y,16,0,pi,INK)
    body += circle(x,y,16,'none','stroke="#7293a8"')
    body += text(270-151*cos(a),213+151*sin(a),str(i+1),'large')
body += text(240,28,'Above the north pole')
body += text(240,392,'1 → 2 → 3 … counterclockwise','small muted')
svg('moon-orbit',480,415,'Top-down Moon orbit: sunlight comes from the left; eight numbered positions surround Earth',body)

names=['New Moon','Waxing crescent','First quarter','Waxing gibbous','Full Moon','Waning gibbous','Third quarter','Waning crescent']
for i,name in enumerate(names):
    a=i*pi/4
    body=circle(40,40,34,DARK)
    body+=illuminated(40,40,34,-cos(a),0 if i<=4 else pi,INK)
    body+=circle(40,40,34,'none','stroke="#7293a8"')
    svg(f'phase-{i+1}',80,80,name+' as seen from Earth, with lunar north up',body)

for lunar in [False,True]:
    body=circle(32,75,25,GOLD)+text(32,130,'Sun')
    if lunar:
        body += '<path d="M150 54L348 69V81L150 96Z" fill="#080e17" stroke="#7293a8"/>'
        body += circle(150,75,21,'#39768c',f'stroke="{TEAL}"')+text(150,130,'Earth')
        body += circle(282,75,9,'#be765c')+text(282,130,'Full Moon')
        body += text(255,35,'Earth’s shadow','small')
    else:
        body += '<path d="M150 66L310 75L150 84Z" fill="#080e17" stroke="#7293a8"/>'
        body += circle(150,75,9,'#b6c7d1')+text(150,130,'New Moon')
        body += circle(300,75,21,'#39768c',f'stroke="{TEAL}"')+text(300,130,'Earth')
        body += circle(280,75,3,DARK)
        body += text(235,35,'Moon’s shadow','small')
    svg('lunar-eclipse' if lunar else 'solar-eclipse',360,155,
        'Lunar eclipse: Sun, Earth, Moon' if lunar else 'Solar eclipse: Sun, Moon, Earth',body)

body='<defs><radialGradient id="glow"><stop offset=".68" stop-color="#f39565" stop-opacity=".8"/><stop offset="1" stop-color="#f39565" stop-opacity="0"/></radialGradient></defs>'
body+=circle(160,105,85,'url(#glow)')+circle(160,105,60,DARK,'stroke="#e9956a" stroke-width="3"')
body+=text(160,202,'Earth hides the Sun')+text(160,226,'Sunlight filters through the atmospheric rim','small muted')
body+='<path d="M0 270Q85 246 160 265T320 257V300H0Z" fill="#70534b"/>'
svg('terran-eclipse',320,300,'From the Moon during a total lunar eclipse: dark Earth with a reddish atmospheric rim above dim lunar ground',body)
print('Rendered 16 explanatory SVG diagrams.')
