#!/usr/bin/env python
# gdal to wavefront obj

try:
    from osgeo import gdal
except ImportError:
    import gdal

import sys

try:
    import numpy as Numeric
except ImportError:
    import Numeric

# =============================================================================
def Usage():
    print('Usage: gdal2xyz.py [-skip factor] [-srcwin xoff yoff width height]')
    print('                   [-band b] [-csv] srcfile [dstfile]')
    print('')
    sys.exit( 1 )

# =============================================================================
#
# Program mainline.
#

if __name__ == '__main__':

    srcwin = None
    skip = 1    
    srcfile = None
    dstfile = None
    band_nums = []
    delim = ' '

    gdal.AllRegister()
    argv = gdal.GeneralCmdLineProcessor( sys.argv )
    if argv is None:
        sys.exit( 0 )

    # Parse command line arguments.
    i = 1
    while i < len(argv):
        arg = argv[i]

        if arg == '-srcwin':
            srcwin = (int(argv[i+1]),int(argv[i+2]),
                      int(argv[i+3]),int(argv[i+4]))
            i = i + 4

        elif arg == '-skip':
            skip = int(argv[i+1])
            i = i + 1

        elif arg == '-band':
            band_nums.append( int(argv[i+1]) )
            i = i + 1

        elif arg == '-csv':
            delim = ','

        elif arg[0] == '-':
            Usage()

        elif srcfile is None:
            srcfile = arg

        elif dstfile is None:
            dstfile = arg

        else:
            Usage()

        i = i + 1

    if srcfile is None:
        Usage()

    if band_nums == []: band_nums = [1]
    # Open source file. 
    srcds = gdal.Open( srcfile )
    if srcds is None:
        print('Could not open %s.' % srcfile)
        sys.exit( 1 )

    bands = []
    for band_num in band_nums: 
        band = srcds.GetRasterBand(band_num)
        if band is None:
            print('Could not get band %d' % band_num)
            sys.exit( 1 )
        bands.append(band)

    gt = srcds.GetGeoTransform()
  
    # Collect information on all the source files.
    if srcwin is None:
        srcwin = (0,0,srcds.RasterXSize,srcds.RasterYSize)

    # Open the output file.
    if dstfile is not None:
        dst_fh = open(dstfile,'wt')
    else:
        dst_fh = sys.stdout

    dst_fh.write("# ANSELM\n");
    dst_fh.write("# hook.org\n");
    dst_fh.write("mtllib untitled.mtl\n");
    dst_fh.write("o SRTM\n");

    band_format = (("%g" + delim) * len(bands)).rstrip(delim) + '\n'

    # Setup an appropriate print format.
    if abs(gt[0]) < 180 and abs(gt[3]) < 180 \
       and abs(srcds.RasterXSize * gt[1]) < 180 \
       and abs(srcds.RasterYSize * gt[5]) < 180:
        format = 'v %.10g' + delim + '%.10g' + delim + '%s' + '\n'
    else:
        format = 'v %.3f' + delim + '%.3f' + delim + '%s' + '\n'

    # Loop emitting data.

    vertices = []
    tallest = 0

    for y in range(srcwin[1],srcwin[1]+srcwin[3],skip):

        data = []
        for band in bands:

            band_data = band.ReadAsArray( srcwin[0], y, srcwin[2], 1 )    
            band_data = Numeric.reshape( band_data, (srcwin[2],) )
            data.append(band_data)

        previous = 0

        for x_i in range(0,srcwin[2],skip):

            x = x_i + srcwin[0]

            geo_x = gt[0] + (x+0.5) * gt[1] + (y+0.5) * gt[2]
            geo_y = gt[3] + (x+0.5) * gt[4] + (y+0.5) * gt[5]

            x_i_data = []
            for i in range(len(bands)):
                x_i_data.append(data[i][x_i])
            
            band_str = band_format % tuple(x_i_data)
            geo_z = float(band_str)

            # just for debugging
            if geo_z > tallest:
                tallest = geo_z
                sys.stdout.write(str(tallest))
                sys.stdout.write("\n")

            # try eliminate spikes around edges
            if geo_z > previous + 1200:
                sys.stdout.write("removed vertex " + str(geo_z) + "\n")
                previous = geo_z
                geo_z = -1
            else:
                previous = geo_z

            # there is some random noise outlier stuff i am trying to remove
            if geo_z > 16400:
                geo_z = -1
                previous = 0

            if geo_z < 0:
                geo_z = -1
                previous = 0

            # mark these vertices as do not use because they are sea level or below
            if geo_z <= 0:
                vertices.append(0)
            else:
                vertices.append(1)

            # fiddle with scale a bit
            geo_z = geo_z/100000*5

            # save it
            line = format % (float(geo_x),float(geo_y), float(geo_z) )
            dst_fh.write( line )

    for y in range(srcwin[1],srcwin[1]+srcwin[3]-1,skip):

        for x_i in range(0,srcwin[2]-1,skip):

            x = x_i + y * srcwin[2]
            x2 = x+srcwin[2]

            if vertices[x] == 0 or vertices[x+1] == 0 or vertices[x2] == 0 or vertices[x2+1] == 0:
                continue

            line = "f %d %d %d\n" % (x+2,x+1,x2+1)

            dst_fh.write( line )

            line = "f %d %d %d\n" % (x+2,x2+1,x2+2)

            dst_fh.write( line )

