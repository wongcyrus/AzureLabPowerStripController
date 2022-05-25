import asyncio
from time import sleep
from kasa import DeviceType
from kasa import Discover
from sys import platform


async def main():
    devices = await Discover.discover()

    stripSockets = []
    for addr, dev in devices.items():
        await dev.update()
        if dev.device_type == DeviceType.Strip:
            print(f"{addr} >> {dev.children}")
            stripSockets += dev.children

    for plug in stripSockets:
        print(f"{plug.alias}: {plug.is_on}")
        if plug.is_on: 
            await plug.turn_off()
        else:    
            await plug.turn_on()
        sleep(1)

if __name__ == "__main__":
    if platform == "win32":        
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())