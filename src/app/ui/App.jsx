import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import { shortcutActions, priorities, ShortcutManager } from '../lib/shortcut';
import { ToastContainer } from './components/Toast';
import { actions as machineActions } from '../flux/machine';
import { actions as developToolsActions } from '../flux/develop-tools';
import { actions as laserActions } from '../flux/laser';
import { actions as editorActions } from '../flux/editor';
import { actions as cncActions } from '../flux/cnc';
import { actions as printingActions } from '../flux/printing';
import { actions as workspaceActions } from '../flux/workspace';
import { actions as textActions } from '../flux/text';
import { actions as settingActions } from '../flux/setting';
import HomePage from './pages/HomePage';
import Workspace from './pages/Workspace';
import Printing from './pages/Printing';
import Cnc from './pages/Cnc';
import Laser from './pages/Laser';
import Settings from './pages/Settings';
import UniApi from '../lib/uni-api';
import AppLayout from './layouts/AppLayout';

class App extends PureComponent {
    static propTypes = {
        resetUserConfig: PropTypes.func.isRequired,
        machineInit: PropTypes.func.isRequired,
        developToolsInit: PropTypes.func.isRequired,
        functionsInit: PropTypes.func.isRequired,
        workspaceInit: PropTypes.func.isRequired,
        textInit: PropTypes.func.isRequired,
        shouldCheckForUpdate: PropTypes.bool.isRequired,
        enableShortcut: PropTypes.bool.isRequired,
        updateMultipleEngine: PropTypes.func.isRequired,
        menuDisabledCount: PropTypes.number
    };

    router = React.createRef();

    shortcutHandler = {
        title: this.constructor.name,
        isActive: () => this.props.enableShortcut,
        // active: false,
        priority: priorities.APP,
        shortcuts: {
            // TODO: implement file menu actions
            [shortcutActions.OPEN]: () => {
                if (this.props.menuDisabledCount <= 0) {
                    UniApi.Event.emit('appbar-menu:open-file');
                }
            },
            [shortcutActions.SAVE]: () => {
                if (this.props.menuDisabledCount <= 0) {
                    UniApi.Event.emit('appbar-menu:save');
                }
            },
            [shortcutActions.SAVE_AS]: () => {
                if (this.props.menuDisabledCount <= 0) {
                    UniApi.Event.emit('appbar-menu:save-as-file');
                }
            },
            [shortcutActions.IMPORT]: () => {
                if (this.props.menuDisabledCount <= 0) {
                    UniApi.Event.emit('appbar-menu:import');
                }
            },
            [shortcutActions.EXPORT_MODELS]: () => {
                if (this.props.menuDisabledCount <= 0) {
                    UniApi.Event.emit('appbar-menu:export-model');
                }
            },
            [shortcutActions.EXPORT_GCODE]: () => {
                if (this.props.menuDisabledCount <= 0) {
                    UniApi.Event.emit('appbar-menu:export-gcode');
                }
            },
            'RESETUSERCONFIG': { // reset user config, which equivalent to fully reinstallation
                keys: ['alt+shift+r'],
                callback: () => {
                    this.props.resetUserConfig();
                }
            },
            'LISTALLSHORTCUTS': {
                keys: ['mod+alt+k l'],
                callback: () => {
                    ShortcutManager.printList();
                }
            },
            'MULTIPLEENGINE': {
                keys: ['mod+alt+k e'],
                callback: () => {
                    this.props.updateMultipleEngine();
                }
            }
        }
    };

    componentDidMount() {
        // disable select text on document
        document.onselectstart = () => {
            return false;
        };
        // init machine module
        // TODO: move init to proper page
        this.props.machineInit();
        this.props.developToolsInit();

        this.props.functionsInit();
        this.props.workspaceInit();
        this.props.textInit();
        UniApi.Window.initWindow();
        // auto update
        setTimeout(() => {
            if (this.props.shouldCheckForUpdate) {
                UniApi.Update.checkForUpdate();
            }
        }, 200);

        ShortcutManager.register(this.shortcutHandler);
        setTimeout(() => {
            UniApi.Window.showMainWindow();
        }, 0);
    }

    logPageView() {
        const path = window.location.pathname + window.location.search + window.location.hash;
        ReactGA.set({ page: path });
        ReactGA.pageview(path);
    }

    render() {
        return (
            <HashRouter ref={this.router}>
                <AppLayout>
                    <Switch>
                        <Route path="/" exact component={HomePage} />
                        <Route path="/workspace" component={Workspace} />
                        <Route path="/printing" component={Printing} />
                        <Route path="/laser" component={Laser} />
                        <Route path="/cnc" component={Cnc} />
                        <Route path="/settings" component={Settings} />
                        <Route component={HomePage} />
                    </Switch>
                    <ToastContainer
                        position="top-center"
                        autoClose={5000}
                        hideProgressBar
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </AppLayout>
            </HashRouter>
        );
    }
}

const mapStateToProps = (state) => {
    const machineInfo = state.machine;
    const { menuDisabledCount } = state.appbarMenu;
    let enableShortcut = state[window.location.hash.slice(2)]?.enableShortcut;
    enableShortcut = (typeof enableShortcut === 'undefined' ? true : enableShortcut);
    const { shouldCheckForUpdate } = machineInfo;
    return {
        enableShortcut,
        menuDisabledCount,
        shouldCheckForUpdate
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        resetUserConfig: () => dispatch(settingActions.resetUserConfig()),
        machineInit: () => dispatch(machineActions.init()),
        developToolsInit: () => dispatch(developToolsActions.init()),
        workspaceInit: () => dispatch(workspaceActions.init()),
        laserInit: () => dispatch(laserActions.init()),
        cncInit: () => dispatch(cncActions.init()),
        printingInit: () => dispatch(printingActions.init()),
        textInit: () => dispatch(textActions.init()),
        functionsInit: () => {
            dispatch(editorActions.initSelectedModelListener('laser'));
            dispatch(editorActions.initSelectedModelListener('cnc'));
        },
        updateMultipleEngine: () => dispatch(machineActions.updateMultipleEngine())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
