import isEmpty from 'lodash/isEmpty';
import { gcodeToBufferGeometry } from './GcodeToBufferGeometry';

onmessage = (e) => {
    if (isEmpty(e.data)) {
        postMessage({ status: 'err', value: 'Data is empty' });
        return;
    }
    const { func, gcodeFilename, extruderColors } = e.data;
    if (!['3DP', 'LASER', 'CNC'].includes(func.toUpperCase())) {
        postMessage({ status: 'err', value: `Unsupported func: ${func}` });
        return;
    }
    if (isEmpty(gcodeFilename)) {
        postMessage({ status: 'err', value: 'Gcode filename is empty' });
        return;
    }

    gcodeToBufferGeometry(
        func.toUpperCase(),
        gcodeFilename,
        extruderColors,
        (progress) => {
            postMessage({ status: 'progress', value: progress });
        },
        (err) => {
            postMessage({ status: 'err', value: err });
        }
    ).then((result) => {
        const { bufferGeometry, layerCount, bounds } = result;
        const positions = bufferGeometry.getAttribute('position').array;
        const colors = bufferGeometry.getAttribute('a_color').array;
        const colors1 = bufferGeometry.getAttribute('a_color1').array;
        const layerIndices = bufferGeometry.getAttribute('a_layer_index').array;
        const typeCodes = bufferGeometry.getAttribute('a_type_code').array;
        const toolCodes = bufferGeometry.getAttribute('a_tool_code').array;
        const data = {
            status: 'succeed',
            value: {
                positions,
                colors,
                colors1,
                layerIndices,
                typeCodes,
                toolCodes,
                layerCount,
                bounds
            }
        };
        postMessage(
            data,
            [
                positions.buffer,
                colors.buffer,
                colors1.buffer,
                layerIndices.buffer,
                typeCodes.buffer,
                toolCodes.buffer,
            ]
        );
    });
};
