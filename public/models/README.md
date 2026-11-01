# Cortical surface

`brain-cortex.bin` is derived from the left/right fsaverage5 pial surfaces and
sulcal-depth data distributed by Nilearn, revision
`cccc7ab5b157fcd2e747323ace72599a3a04fb98`:

https://github.com/nilearn/nilearn/tree/cccc7ab5b157fcd2e747323ace72599a3a04fb98/nilearn/datasets/data/fsaverage5

The original fsaverage template is from FreeSurfer. Nilearn's redistribution
license is retained in `LICENSE-nilearn.txt`.

The file contains 20,484 records of seven little-endian float32 values:
position XYZ, outward normal XYZ, and normalized cortical ridge height.
Positions are centered, normalized to 2.35 units across, and rotated from RAS
coordinates into a frontal three-quarter view (25 degrees), with vertical scale 0.93. Mesh vertex normals are the
normalized area-weighted sum of neighboring face normals; ridge height is
clamp((0.65 - sulcalDepth) / 1.8, 0.05, 1).

`brain-cortex-index.bin` contains 40,960 triangles as little-endian uint32 vertex
indices. These drive an invisible depth surface so far-side particles do not
show through the cortical folds.

It is a static decorative asset, not patient data or a diagnostic model.
