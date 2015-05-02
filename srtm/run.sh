
echo "Make a bunch of srtms in geotiff into a single one"
rm big.tif
/opt/local/share/examples/py27-gdal/scripts/gdal_merge.py srtm_12_04.tif srtm_12_05.tif srtm_12_06.tif srtm_13_05.tif srtm_13_06.tif srtm_14_06.tif -o big.tif

echo "carve the big geotiff against a border shapefile to get only what is inside it"
rm clipped.tif
gdalwarp -cutline test.shp -crop_to_cutline -dstalpha big.tif clipped.tif

echo "Make the big clipped geotiff smaller"
rm smaller.tif
gdalwarp -ts 1024 0 -r cubic -co "TFW=YES" clipped.tif smaller.tif

echo "convert the geotiff to a blender3d wavefront obj file"
./gdal2obj.py smaller.tif california.obj

