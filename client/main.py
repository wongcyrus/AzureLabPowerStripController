import asyncio
from time import sleep
from kasa import DeviceType
from kasa import Discover
from sys import platform
import asyncio
from azure.iot.device.aio import IoTHubDeviceClient
import os
from dotenv import load_dotenv

load_dotenv()


async def update_plug(patch):
    devices = await Discover.discover()
    stripSockets = []
    for addr, dev in devices.items():
        await dev.update()
        if dev.device_type == DeviceType.Strip:
            print(f"{addr} >> {dev.children}")
            stripSockets += dev.children
    for plug in stripSockets:
        key = plug.alias.replace(" ", "_")
        if key not in patch:
            continue
        value = patch[key]
        if value and not plug.is_on:
            await plug.turn_on()
            sleep(1)
        if not value and plug.is_on:
            await plug.turn_off()
            sleep(1)


async def main():
    device_id = os.getenv("DeviceId")
    hostname = os.getenv("IotHubName")
    if not hostname.endswith(".azure-devices.net"):
        hostname = hostname + ".azure-devices.net"
    symmetric_key = os.getenv("DeviceKey")

    # Create instance of the device client using the authentication provider
    device_client = IoTHubDeviceClient.create_from_symmetric_key(
        device_id=device_id, hostname=hostname, symmetric_key=symmetric_key)

    # Connect the device client.
    await device_client.connect()

    # define behavior for receiving a twin patch

    async def twin_patch_handler(patch):
        print("the data in the desired properties patch was: {}".format(patch))
        await update_plug(patch)
        patch.pop('$version',None)
        await device_client.patch_twin_reported_properties(patch)

    # set the twin patch handler on the client
    device_client.on_twin_desired_properties_patch_received = twin_patch_handler

    # Wait for user to indicate they are done listening for messages
    while True:
        selection = input("Press Q to quit\n")
        if selection == "Q" or selection == "q":
            print("Quitting...")
            break
    # finally, shut down the client
    await device_client.shutdown()

if __name__ == "__main__":
    if platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
