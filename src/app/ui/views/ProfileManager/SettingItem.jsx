import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GithubPicker } from 'react-color';
import classNames from 'classnames';
import i18n from '../../../lib/i18n';
import Select from '../../components/Select';
import { NumberInput as Input } from '../../components/Input';
import Checkbox from '../../components/Checkbox';
import { PRINTING_MATERIAL_CONFIG_COLORS } from '../../../constants';

import TipTrigger from '../../components/TipTrigger';
import SvgIcon from '../../components/SvgIcon';
import styles from './styles.styl';

function SettingItem({ definitionKey, settings, isDefaultDefinition = () => true, onChangeDefinition, defaultValue, styleSize = 'large' }) {
    const [showColor, setShowColor] = useState(false);

    const setting = settings[definitionKey];

    const isProfile = !isDefaultDefinition();
    const { label, description, type, unit = '', enabled, options, min, max } = setting;
    const settingDefaultValue = setting.default_value;
    const isDefault = defaultValue && (defaultValue.value === settingDefaultValue);
    if (typeof enabled === 'string') {
        if (enabled.indexOf(' and ') !== -1) {
            const andConditions = enabled.split(' and ').map(c => c.trim());
            for (const condition of andConditions) {
            // parse resolveOrValue('adhesion_type') == 'skirt'
                const enabledKey = condition.match("resolveOrValue\\('(.[^)|']*)'") ? condition.match("resolveOrValue\\('(.[^)|']*)'")[1] : null;
                const enabledEqualValue = condition.match("== ?'(.[^)|']*)'") ? condition.match("== ?'(.[^)|']*)'")[1] : null;
                const enabledUnequalValue = condition.match("!= ?'(.[^)|']*)'") ? condition.match("!= ?'(.[^)|']*)'")[1] : null;
                const enabledGreaterValue = condition.match('> ?([0-9]+)') ? condition.match('> ?([0-9]+)')[1] : null;
                const enabledLessValue = condition.match('< ?([0-9]+)') ? condition.match('< ?([0-9]+)')[1] : null;
                if (enabledKey) {
                    if (settings[enabledKey]) {
                        const value = settings[enabledKey].default_value;
                        if (enabledEqualValue && value !== enabledEqualValue) {
                            return null;
                        }
                        if (enabledUnequalValue && value === enabledUnequalValue) {
                            return null;
                        }
                        if (enabledGreaterValue && value <= enabledGreaterValue) {
                            return null;
                        }
                        if (enabledLessValue && value >= enabledLessValue) {
                            return null;
                        }
                        if (settings[enabledKey].type === 'bool' && !value) {
                            return null;
                        }
                    }
                } else {
                    if (settings[condition]) {
                        const value = settings[condition].default_value;
                        if (!value) {
                            return null;
                        }
                    }
                }
            }
        } else {
            const orConditions = enabled.split(' or ')
                .map(c => c.trim());
            let result = false;
            for (const condition of orConditions) {
                if (settings[condition]) {
                    const value = settings[condition].default_value;
                    if (value) {
                        result = true;
                    }
                }
                if (condition.match('(.*) > ([0-9]+)')) {
                    const m = condition.match('(.*) > ([0-9]+)');
                    const enabledKey = m[1];
                    const enabledValue = parseInt(m[2], 10);
                    if (settings[enabledKey]) {
                        const value = settings[enabledKey].default_value;
                        if (value > enabledValue) {
                            result = true;
                        }
                    }
                }
                if (condition.match('(.*) < ([0-9]+)')) {
                    const m = condition.match('(.*) > ([0-9]+)');
                    const enabledKey = m[1];
                    const enabledValue = parseInt(m[2], 10);
                    if (settings[enabledKey]) {
                        const value = settings[enabledKey].default_value;
                        if (value < enabledValue) {
                            result = true;
                        }
                    }
                }
                if (condition.match("resolveOrValue\\('(.[^)|']*)'")) {
                    const m1 = condition.match("resolveOrValue\\('(.[^)|']*)'");
                    const m2 = condition.match("== ?'(.[^)|']*)'");
                    const enabledKey = m1[1];
                    const enabledValue = (m2 && m2[1]) || true;
                    if (settings[enabledKey]) {
                        const value = settings[enabledKey].default_value;
                        if (value === enabledValue) {
                            result = true;
                        }
                    }
                }
            }
            if (!result) {
                return null;
            }
        }
    } else if (typeof enabled === 'boolean' && enabled === false) {
        return null;
    }
    const opts = [];
    if (options) {
        Object.keys(options).forEach((k) => {
            opts.push({
                value: k,
                label: i18n._(options[k])
            });
        });
    }
    return (
        <TipTrigger title={i18n._(label)} content={i18n._(description)} key={definitionKey}>
            <div className="position-re sm-flex justify-space-between height-32 margin-vertical-8">
                <span className="text-overflow-ellipsis width-auto main-text-normal max-width-160">
                    {i18n._(label)}
                </span>
                <div className="sm-flex-auto">
                    {isProfile && !isDefault && (
                        <SvgIcon
                            className="margin-horizontal-4"
                            name="Reset"
                            size={24}
                            // className={}
                            onClick={() => {
                                onChangeDefinition(definitionKey, (defaultValue && defaultValue.value) ?? settingDefaultValue);
                            }}
                        />
                    )}
                    {type === 'float' && (
                        <Input
                            suffix={unit}
                            className="sm-flex-width align-r"
                            value={settingDefaultValue}
                            min={min}
                            max={max}
                            size={styleSize}
                            onChange={(value) => {
                                onChangeDefinition(definitionKey, value);
                            }}
                        />
                    )}
                    {type === 'int' && (
                        <Input
                            suffix={unit}
                            className="sm-flex-width align-r"
                            value={settingDefaultValue}
                            size={styleSize}
                            // disabled={!isDefinitionEditable()}
                            onChange={(value) => {
                                onChangeDefinition(definitionKey, value);
                            }}
                        />
                    )}
                    {type === 'bool' && (
                        <Checkbox
                            className="sm-flex-width align-r"
                            defaultChecked={settingDefaultValue}
                            // disabled={!isDefinitionEditable()}
                            type="checkbox"
                            checked={settingDefaultValue}
                            onChange={(event) => onChangeDefinition(definitionKey, event.target.checked)}
                        />
                    )}
                    {type === 'enum' && (
                        <Select
                            className="sm-flex-width align-r"
                            backspaceRemoves={false}
                            clearable={false}
                            size={styleSize}
                            menuContainerStyle={{ zIndex: 5 }}
                            name={definitionKey}
                            // disabled={!isDefinitionEditable()}
                            options={opts}
                            value={settingDefaultValue}
                            onChange={(option) => {
                                onChangeDefinition(definitionKey, option.value);
                            }}
                        />
                    )}
                    {type === undefined && (
                        <Input
                            size={styleSize}
                            className="sm-flex-width align-r"
                            value={settingDefaultValue}
                            // disabled={!isDefinitionEditable()}
                            onChange={(value) => {
                                onChangeDefinition(definitionKey, value);
                            }}
                        />
                    )}
                    {type === undefined && (
                        <span className="sm-parameter-row__input-unit">{unit}</span>
                    )}
                    {type === 'color' && (
                        <div
                            className="sm-flex-width align-r height-percent-100 width-96 display-inline border-radius-8"
                            role="button"
                            tabIndex="-1"
                            onKeyPress={() => {}}
                            style={{
                                background: settingDefaultValue,
                                border: '1px solid #B9BCBF'
                            }}
                            onClick={() => setShowColor(!showColor)}
                        />
                    )}
                </div>
            </div>
            {showColor && (
                <div className={classNames(styles['color-selection'])}>
                    <span>
                        color
                    </span>
                    <GithubPicker
                        width={275}
                        triangle="hide"
                        colors={PRINTING_MATERIAL_CONFIG_COLORS}
                        color={settingDefaultValue}
                        onChangeComplete={(event) => {
                            onChangeDefinition(definitionKey, event.hex);
                        }}
                    />
                </div>
            )}
        </TipTrigger>
    );
}
SettingItem.propTypes = {
    settings: PropTypes.object.isRequired,
    definitionKey: PropTypes.string.isRequired,
    isDefaultDefinition: PropTypes.func,
    onChangeDefinition: PropTypes.func.isRequired,
    defaultValue: PropTypes.object,
    styleSize: PropTypes.string
};

export default React.memo(SettingItem);
// export default (SettingItem);
