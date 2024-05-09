import React from "react";
import PlatformSettings from "./PlatformSettings/index";

const AppSettings = () => {
    return(
        <>
            <div className="bg-[#090016] h-full w-full items-between justify-between lg:justify-between display sm:grid"
            style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: 600, height: 900, marginLeft:'20vh', marginTop: '10vh' }}>
                    <PlatformSettings/>
                </div>
            </div>
        </>
    )
}

export default AppSettings