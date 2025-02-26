import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';


import { shortcutActions, priorities, ShortcutManager } from '../../lib/shortcut';
import styles from './index.styl';
import { SVG_EVENT_CONTEXTMENU, SVG_EVENT_MODE } from './constants';
import SVGCanvas from './SVGCanvas';
import SVGLeftBar from './SVGLeftBar';

class SVGEditor extends PureComponent {
    static propTypes = {
        // eslint-disable-next-line react/no-unused-prop-types
        isActive: PropTypes.bool,
        size: PropTypes.object.isRequired,
        materials: PropTypes.object.isRequired,
        SVGActions: PropTypes.object.isRequired,
        scale: PropTypes.number.isRequired,
        minScale: PropTypes.number,
        maxScale: PropTypes.number,
        target: PropTypes.object,
        coordinateMode: PropTypes.object.isRequired,
        coordinateSize: PropTypes.object.isRequired,
        editable: PropTypes.bool,
        menuDisabledCount: PropTypes.number,

        updateScale: PropTypes.func.isRequired,
        updateTarget: PropTypes.func.isRequired,

        initContentGroup: PropTypes.func.isRequired,
        showContextMenu: PropTypes.func,

        // insertDefaultTextVector: PropTypes.func.isRequired

        // editor actions
        onCreateElement: PropTypes.func.isRequired,
        onSelectElements: PropTypes.func.isRequired,
        onClearSelection: PropTypes.func.isRequired,
        onMoveSelectedElementsByKey: PropTypes.func.isRequired,
        updateTextTransformationAfterEdit: PropTypes.func.isRequired,
        getSelectedElementsUniformScalingState: PropTypes.func.isRequired,

        elementActions: PropTypes.shape({
            moveElementsStart: PropTypes.func.isRequired,
            moveElements: PropTypes.func.isRequired,
            moveElementsFinish: PropTypes.func.isRequired,
            resizeElementsStart: PropTypes.func.isRequired,
            resizeElements: PropTypes.func.isRequired,
            resizeElementsFinish: PropTypes.func.isRequired,
            rotateElementsStart: PropTypes.func.isRequired,
            rotateElements: PropTypes.func.isRequired,
            rotateElementsFinish: PropTypes.func.isRequired,
            moveElementsOnKeyDown: PropTypes.func.isRequired
        }).isRequired,
        editorActions: PropTypes.object.isRequired,

        createText: PropTypes.func.isRequired,

        onChangeFile: PropTypes.func.isRequired,
        onClickToUpload: PropTypes.func.isRequired,
        fileInput: PropTypes.object.isRequired,
        allowedFiles: PropTypes.string.isRequired,
        headType: PropTypes.string
    };

    flag = (Math.random() * 100).toFixed();

    canvas = React.createRef();

    leftBarRef = React.createRef();

    state = {
        mode: 'select'
    };

    shortcutHandler = {
        title: this.constructor.name,
        // TODO: unregister in case of component is destroyed
        isActive: () => this.props.isActive,
        priority: priorities.VIEW,
        shortcuts: {
            [shortcutActions.UNDO]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.undo();
                }
            },
            [shortcutActions.REDO]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.redo();
                }
            },
            [shortcutActions.SELECTALL]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.selectAll();
                }
            },
            [shortcutActions.UNSELECT]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.unselectAll();
                }
            },
            [shortcutActions.DELETE]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.deleteSelectedModel();
                }
            },
            [shortcutActions.COPY]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.copy();
                }
            },
            [shortcutActions.PASTE]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.paste();
                }
            },
            [shortcutActions.DUPLICATE]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.duplicateSelectedModel();
                }
            },
            [shortcutActions.CUT]: () => {
                if (!(this.props.menuDisabledCount > 0)) {
                    this.props.editorActions.cut();
                }
            },
            // optimize: accelerate when continuous click
            'MOVE-UP': {
                keys: ['up'],
                callback: () => {
                    this.props.elementActions.moveElementsStart(this.props.SVGActions.getSelectedElements());
                    this.props.elementActions.moveElements(this.props.SVGActions.getSelectedElements(), { dx: 0, dy: -1 });
                },
                keyupCallback: () => {
                    this.props.elementActions.moveElementsFinish(this.props.SVGActions.getSelectedElements());
                }
            },
            'MOVE-DOWM': {
                keys: ['down'],
                callback: () => {
                    this.props.elementActions.moveElementsStart(this.props.SVGActions.getSelectedElements());
                    this.props.elementActions.moveElements(this.props.SVGActions.getSelectedElements(), { dx: 0, dy: 1 });
                },
                keyupCallback: () => {
                    this.props.elementActions.moveElementsFinish(this.props.SVGActions.getSelectedElements());
                }
            },
            'MOVE-LEFT': {
                keys: ['left'],
                callback: () => {
                    this.props.elementActions.moveElementsStart(this.props.SVGActions.getSelectedElements());
                    this.props.elementActions.moveElements(this.props.SVGActions.getSelectedElements(), { dx: -1, dy: 0 });
                },
                keyupCallback: () => {
                    this.props.elementActions.moveElementsFinish(this.props.SVGActions.getSelectedElements());
                }
            },
            'MOVE-RIGHT': {
                keys: ['right'],
                callback: () => {
                    this.props.elementActions.moveElementsStart(this.props.SVGActions.getSelectedElements());
                    this.props.elementActions.moveElements(this.props.SVGActions.getSelectedElements(), { dx: 1, dy: 0 });
                },
                keyupCallback: () => {
                    this.props.elementActions.moveElementsFinish(this.props.SVGActions.getSelectedElements());
                }
            }

        }
    };


    constructor(props) {
        super(props);

        this.setMode = this.setMode.bind(this);
        ShortcutManager.register(this.shortcutHandler);
    }

    componentDidMount() {
        this.canvas.current.on(SVG_EVENT_MODE, (mode) => {
            this.setState({
                mode: mode
            });
        });

        this.canvas.current.on(SVG_EVENT_CONTEXTMENU, (event) => {
            this.props.showContextMenu(event);
        });

        // Init, Setup SVGContentGroup
        this.props.initContentGroup(this.canvas.current.svgContentGroup);
    }


    setMode(mode, extShape) {
        // this.mode = mode;
        this.canvas.current.setMode(mode, extShape);
    }

    insertDefaultTextVector = async () => {
        const element = await this.props.createText('Snapmaker');
        this.props.onCreateElement(element);

        // todo, select text after create
        // this.canvas.current.selectOnly([elem]);
        this.setMode('select');
    };

    hideLeftBarOverlay = () => {
        this.leftBarRef.current.actions.hideLeftBarOverlay();
    }

    zoomIn() {
        this.canvas.current.zoomIn();
    }

    zoomOut() {
        this.canvas.current.zoomOut();
    }

    autoFocus() {
        this.canvas.current.autoFocus();
    }

    render() {
        return (
            <React.Fragment>
                <div className={styles['laser-table']} style={{ position: 'relative' }}>
                    <div className={styles['laser-table-row']}>
                        <div className={styles['view-space']}>
                            <SVGCanvas
                                className={styles['svg-content']}
                                editable={this.props.editable}
                                SVGActions={this.props.SVGActions}
                                size={this.props.size}
                                materials={this.props.materials}
                                scale={this.props.scale}
                                minScale={this.props.minScale}
                                maxScale={this.props.maxScale}
                                target={this.props.target}
                                updateScale={this.props.updateScale}
                                updateTarget={this.props.updateTarget}
                                coordinateMode={this.props.coordinateMode}
                                coordinateSize={this.props.coordinateSize}
                                ref={this.canvas}
                                onCreateElement={this.props.onCreateElement}
                                onSelectElements={this.props.onSelectElements}
                                onClearSelection={this.props.onClearSelection}
                                onMoveSelectedElementsByKey={this.props.onMoveSelectedElementsByKey}
                                updateTextTransformationAfterEdit={this.props.updateTextTransformationAfterEdit}
                                getSelectedElementsUniformScalingState={this.props.getSelectedElementsUniformScalingState}
                                elementActions={this.props.elementActions}
                                hideLeftBarOverlay={this.hideLeftBarOverlay}
                            />
                        </div>
                        <SVGLeftBar
                            ref={this.leftBarRef}
                            mode={this.state.mode}
                            insertDefaultTextVector={this.insertDefaultTextVector}
                            setMode={this.setMode}
                            onChangeFile={this.props.onChangeFile}
                            onClickToUpload={this.props.onClickToUpload}
                            fileInput={this.props.fileInput}
                            allowedFiles={this.props.allowedFiles}
                            editable={this.props.editable}
                            headType={this.props.headType}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default SVGEditor;
