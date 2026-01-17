import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import GlobalHeader from "./Navigation/GlobalHeader";

const Canvas = () => {
    return (
        <div className="flex flex-col h-screen bg-black">
            <GlobalHeader />

            <main className="flex-1 mt-16 overflow-hidden">
                <div className="w-full h-full">
                    <Excalidraw
                        theme="dark"
                        initialData={{
                            appState: {
                                viewBackgroundColor: "#000000",
                                currentItemFontFamily: 1,
                            }
                        }}
                    />
                </div>
            </main>
        </div>
    );
};

export default Canvas;
