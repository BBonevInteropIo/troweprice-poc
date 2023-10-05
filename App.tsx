import Workspaces, { AddApplicationPopup, AddWindowButton, AddWorkspaceButton, AddWorkspacePopup, EjectButton, GlueLogo, MaximizeGroupButton, RestoreGroupButton, SaveWorkspacePopup, WorkspaceContents, WorkspaceSaveButton, WorkspaceTabCloseButton, WorkspaceTitle, WorkspaceWindowChannelsLink, WorkspaceWindowTabCloseButton, WorkspaceWindowTabTitle, getFrameId } from "@interopio/workspaces-ui-react";
import "@interopio/workspaces-ui-react/dist/styles/popups.css";
import "@interopio/workspaces-ui-react/dist/styles/goldenlayout-base.css";
import "@interopio/workspaces-ui-react/dist/styles/glue42-theme.css";
import "@interopio/workspaces-ui-react/dist/styles/workspaceTabV2.css";
import "./index.css";
import { IOConnectBrowser } from "@interopio/browser";
import { Glue42 } from "@glue42/desktop";
import { IOConnectWorkspaces } from "@interopio/workspaces-api";
import { useIOConnect } from "@interopio/react-hooks";

const App = () => {
    const waitForMyFrame = (io: IOConnectBrowser.API | Glue42.Glue) => {
        return new Promise<IOConnectWorkspaces.Frame>(async (res, rej) => {
            const unsub = await io.workspaces?.onFrameOpened((f) => {
                if (f.id === getFrameId()) {
                    res(f);
                    if (unsub) {
                        unsub();
                    }
                }
            });
            const frames = await io.workspaces?.getAllFrames();
            const myFrame = frames?.find(f => f.id === getFrameId());

            if (myFrame) {
                res(myFrame);
                if (unsub) {
                    unsub();
                }
            }
        });
    };

    useIOConnect(async (io) => {
      (window as any).io = io
        const isPlatform = (window as any).iobrowser?.isPlatformFrame;

        if (!isPlatform) {
            // if this frame is not a platform, we do not wish to load the welcome workspace
            // instead we wish to load the workspace provided to the restore function
            return;
        }

        const myFrame = await waitForMyFrame(io);
        const wsp = (await myFrame.workspaces())[0];
        const newWsp = await io.workspaces?.restoreWorkspace("Welcome", { title: "Welcome", reuseWorkspaceId: wsp.id });
        await newWsp?.setTitle("Welcome");
    });


    return (
         <Workspaces
            components={{
                header: {
                    LogoComponent: GlueLogo,
                    AddWorkspaceComponent: (props) => {
                      return <AddWorkspaceButton {...props}/>
                    },

                    WorkspaceTabComponent: (props) => {
                        return (
                            <>
                                <WorkspaceSaveButton  {...props} showSavePopup={props.onSaveClick} />
                                <WorkspaceTitle  {...props} />
                                <WorkspaceTabCloseButton   {...props} close={props.onCloseClick}/>
                            </>
                        );
                    },
                    SystemButtonsComponent: () => <></>
                },
                groupHeader: {
                    WorkspaceWindowTabComponent: (props) => {
                      console.error(props)
                        return (
                            <>
                                {/* <WorkspaceWindowChannelsLink {...props.channels} /> */}
                                <WorkspaceWindowTabTitle {...props} />
                                <WorkspaceWindowTabCloseButton   {...props.close}/>
                            </>
                        );
                    },
                    ButtonsComponent: (props) => {
                        return (
                            <>
                                <AddWindowButton {...props.addWindow} />
                                <EjectButton {...props.eject}/>
                                <RestoreGroupButton {...props.restore}/>
                                <MaximizeGroupButton maximize={() => props.maximize.maximize}visible={false} />
                            </>
                        );
                    },
                    BeforeTabsComponent: () => <></>,
                    AfterTabsComponent: () => <></>
                },
                popups: {
                    SaveWorkspaceComponent: SaveWorkspacePopup,
                    AddApplicationComponent: AddApplicationPopup,
                    AddWorkspaceComponent: AddWorkspacePopup
                },
              WorkspaceContents: (props) => {
                    return (
                    
                        <WorkspaceContents  {...props} />
                    )
                  },
            }}
        />
    );
}

export default App;
