import {
    MACHINE_SERIES,
    SINGLE_EXTRUDER_TOOLHEAD_FOR_SM2,
    LEVEL_ONE_POWER_LASER_FOR_ORIGINAL,
    LEVEL_TWO_POWER_LASER_FOR_ORIGINAL, LEVEL_ONE_POWER_LASER_FOR_SM2,
    LEVEL_TWO_POWER_LASER_FOR_SM2
} from '../constants';
import {
    CaseConfigOriginalPrintingSingle, CaseConfigOriginalLaserPowerOne,
    CaseConfigOriginalLaserPowerTwo, CaseConfigOriginalCncStandard,
    CaseConfigA150PrintingSingle, CaseConfigA150LaserPowerOne,
    CaseConfigA150LaserPowerTwo, CaseConfigA150CncStandard,
    CaseConfigA250PrintingSingle, CaseConfigA250LaserPowerOne,
    CaseConfigA250LaserPowerTwo, CaseConfigA250CncStandard,
    CaseConfigA350PrintingSingle, CaseConfigA350LaserPowerOne,
    CaseConfigA350LaserPowerTwo, CaseConfigA350CncStandard,
    CaseConfigA250CncFourAxis, CaseConfigA250LaserFourAxis,
    CaseConfigA350CncFourAxis, CaseConfigA350LaserFourAxis
} from '../ui/pages/HomePage/CaseConfig';

export const getCaseList = (series, toolHead) => {
    const { printingToolhead, laserToolhead } = toolHead;
    let caseList = [];
    let caseListFourAxis = [];
    switch (series) {
        case MACHINE_SERIES.ORIGINAL.value:
        case MACHINE_SERIES.CUSTOM.value:
        case MACHINE_SERIES.ORIGINAL_LZ.value:
            caseList = CaseConfigOriginalPrintingSingle;
            if (laserToolhead === LEVEL_ONE_POWER_LASER_FOR_ORIGINAL) {
                caseList = caseList.concat(CaseConfigOriginalLaserPowerOne);
            }
            if (laserToolhead === LEVEL_TWO_POWER_LASER_FOR_ORIGINAL) {
                caseList = caseList.concat(CaseConfigOriginalLaserPowerTwo);
            }
            caseList = caseList.concat(CaseConfigOriginalCncStandard);
            break;
        case MACHINE_SERIES.A150.value:
            if (printingToolhead === SINGLE_EXTRUDER_TOOLHEAD_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA150PrintingSingle);
            }
            if (laserToolhead === LEVEL_ONE_POWER_LASER_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA150LaserPowerOne);
            }
            if (laserToolhead === LEVEL_TWO_POWER_LASER_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA150LaserPowerTwo);
            }
            caseList = caseList.concat(CaseConfigA150CncStandard);
            break;
        case MACHINE_SERIES.A250.value:
            if (printingToolhead === SINGLE_EXTRUDER_TOOLHEAD_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA250PrintingSingle);
            }
            if (laserToolhead === LEVEL_ONE_POWER_LASER_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA250LaserPowerOne);
            }
            if (laserToolhead === LEVEL_TWO_POWER_LASER_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA250LaserPowerTwo);
            }
            caseList = caseList.concat(CaseConfigA250CncStandard);
            caseListFourAxis = caseListFourAxis.concat(CaseConfigA250CncFourAxis);
            caseListFourAxis = caseListFourAxis.concat(CaseConfigA250LaserFourAxis);
            break;
        case MACHINE_SERIES.A350.value:
            if (printingToolhead === SINGLE_EXTRUDER_TOOLHEAD_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA350PrintingSingle);
            }
            if (laserToolhead === LEVEL_ONE_POWER_LASER_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA350LaserPowerOne);
            }
            if (laserToolhead === LEVEL_TWO_POWER_LASER_FOR_SM2) {
                caseList = caseList.concat(CaseConfigA350LaserPowerTwo);
            }
            caseList = caseList.concat(CaseConfigA350CncStandard);
            caseListFourAxis = caseListFourAxis.concat(CaseConfigA350CncFourAxis);
            caseListFourAxis = caseListFourAxis.concat(CaseConfigA350LaserFourAxis);
            break;
        default:
            break;
    }
    return {
        caseList,
        caseListFourAxis
    };
};
