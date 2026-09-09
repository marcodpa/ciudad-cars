# Showroom isolation matte

Mode: built-in image_gen, one derived technical asset.

Use case: precise-object-edit
Asset type: technical grayscale isolation matte for an existing full-color car image. This is a mask-only derivative, not a redesigned photograph.
Input image is the exact edit target. Convert it into one aligned, flat two-tone grayscale alpha mask. Keep the exact complete 1859 x 846 pixel canvas without resizing, cropping, shifting, margins or changing perspective.
WHITE = every pixel inside the existing car's exact silhouette, including all dark tinted windows, mirrors, lamps, tires, rims, grille, body panels, bumper, underbody, license plate and vehicle parts. Fill the complete vehicle uniformly PURE WHITE RGB(255,255,255). No internal lines, reflections, shadows, textures, holes, details or gray shading inside the vehicle. Black glass and black tires become solid white just like the body.
BLACK = every pixel outside the exact existing vehicle silhouette, including the entire checkerboard background, visible background gaps beneath the chassis, around and between the wheels, and any area not occupied by the actual car. Fill it uniformly PURE BLACK RGB(0,0,0), opaque. No checkerboard, ground plane, contact shadow, detached shape or background detail.
BOUNDARY = follow the original car's precise outer silhouette in the exact same pixel coordinates. Crisp contour with only minimal accurate antialiasing at the edge. Preserve mirrors, fine roof outline, bumper shape and individual tire contours. Absolutely no movement, enlargement, shrinking, crop, repositioning or camera changes. This matte must overlay the provided image exactly so its original colored pixels can be extracted.
Output exactly one 1859x846 black-background image showing the featureless solid-white silhouette of the existing car, with no labels, text, watermark, gray fill or added objects.
