import pod from "./selectors";

import { PodType } from "app/store/pod/types";
import {
  controller as controllerFactory,
  controllerState as controllerStateFactory,
  machine as machineFactory,
  machineState as machineStateFactory,
  pod as podFactory,
  podState as podStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

describe("pod selectors", () => {
  it("can get all items", () => {
    const items = [podFactory(), podFactory()];
    const state = rootStateFactory({
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.all(state)).toEqual(items);
  });

  it("can get all KVMs that MAAS supports", () => {
    const items = [
      podFactory({ type: PodType.VIRSH }),
      podFactory({ type: PodType.LXD }),
    ];
    const state = rootStateFactory({
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.kvms(state)).toStrictEqual([items[0], items[1]]);
  });

  it("can get all LXD pods", () => {
    const items = [
      podFactory({ type: PodType.VIRSH }),
      podFactory({ type: PodType.LXD }),
    ];
    const state = rootStateFactory({
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.lxd(state)).toStrictEqual([items[1]]);
  });

  it("can get all virsh pods", () => {
    const items = [
      podFactory({ type: PodType.VIRSH }),
      podFactory({ type: PodType.LXD }),
    ];
    const state = rootStateFactory({
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.virsh(state)).toStrictEqual([items[0]]);
  });

  it("can get the loading state", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        loading: true,
      }),
    });
    expect(pod.loading(state)).toEqual(true);
  });

  it("can get the loaded state", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        loaded: true,
      }),
    });
    expect(pod.loaded(state)).toEqual(true);
  });

  it("can get the saving state", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        saving: true,
      }),
    });
    expect(pod.saving(state)).toEqual(true);
  });

  it("can get the saved state", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        saved: true,
      }),
    });
    expect(pod.saved(state)).toEqual(true);
  });

  it("can get the active pod id", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        active: 1,
      }),
    });
    expect(pod.activeID(state)).toEqual(1);
  });

  it("can get the active pod", () => {
    const activePod = podFactory();
    const state = rootStateFactory({
      pod: podStateFactory({
        active: activePod.id,
        items: [activePod],
      }),
    });
    expect(pod.active(state)).toEqual(activePod);
  });

  it("can get the errors state", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        errors: "Data is incorrect",
      }),
    });
    expect(pod.errors(state)).toStrictEqual("Data is incorrect");
  });

  it("can get a pod by id", () => {
    const items = [podFactory({ id: 111 }), podFactory({ id: 222 })];
    const state = rootStateFactory({
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.getById(state, 222)).toStrictEqual(items[1]);
  });

  it("can get a pod's host machine", () => {
    const items = [podFactory({ host: "abc123" })];
    const machineItems = [
      machineFactory({ system_id: "abc123" }),
      machineFactory(),
    ];
    const state = rootStateFactory({
      controller: controllerStateFactory({
        items: [controllerFactory()],
      }),
      machine: machineStateFactory({
        items: machineItems,
      }),
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.getHost(state, items[0])).toStrictEqual(machineItems[0]);
  });

  it("can get a pod's host controller", () => {
    const items = [podFactory({ host: "abc123" })];
    const controllerItems = [
      controllerFactory({ system_id: "abc123" }),
      controllerFactory(),
    ];
    const state = rootStateFactory({
      controller: controllerStateFactory({
        items: controllerItems,
      }),
      machine: machineStateFactory({
        items: [machineFactory()],
      }),
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.getHost(state, items[0])).toStrictEqual(controllerItems[0]);
  });

  it("can get all pod hosts", () => {
    const items = [
      podFactory({ host: "aaaaaa" }),
      podFactory({ host: "bbbbbb" }),
      podFactory({ host: "cccccc" }),
    ];
    const controllerItems = [
      controllerFactory({ system_id: "aaaaaa" }),
      controllerFactory({ system_id: "bbbbbb" }),
    ];
    const machineItems = [
      machineFactory({ system_id: "cccccc" }),
      machineFactory({ system_id: "dddddd" }),
    ];
    const state = rootStateFactory({
      controller: controllerStateFactory({
        items: controllerItems,
      }),
      machine: machineStateFactory({
        items: machineItems,
      }),
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.getAllHosts(state)).toStrictEqual([
      controllerItems[0],
      controllerItems[1],
      machineItems[0],
    ]);
  });

  it("can get a pod's VMs", () => {
    const podWithVMs = podFactory();
    const machinesInPod = [
      machineFactory({ pod: { id: podWithVMs.id, name: podWithVMs.name } }),
      machineFactory({ pod: { id: podWithVMs.id, name: podWithVMs.name } }),
    ];
    const otherMachines = [machineFactory(), machineFactory()];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [...machinesInPod, ...otherMachines],
      }),
      pod: podStateFactory({
        items: [podWithVMs],
      }),
    });
    expect(pod.getVMs(state, podWithVMs)).toStrictEqual(machinesInPod);
  });

  it("can group LXD pods by LXD server address", () => {
    const items = [
      podFactory({ type: PodType.VIRSH }),
      podFactory({ power_address: "172.0.0.1", type: PodType.LXD }),
      podFactory({ power_address: "172.0.0.1", type: PodType.LXD }),
      podFactory({ power_address: "192.168.0.1:8000", type: PodType.LXD }),
      podFactory({ power_address: "192.168.0.1:9000", type: PodType.LXD }),
    ];
    const state = rootStateFactory({
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.groupByLxdServer(state)).toStrictEqual([
      {
        address: "172.0.0.1",
        pods: [items[1], items[2]],
      },
      {
        address: "192.168.0.1:8000",
        pods: [items[3]],
      },
      {
        address: "192.168.0.1:9000",
        pods: [items[4]],
      },
    ]);
  });

  it("can get LXD pods by LXD server address", () => {
    const items = [
      podFactory({ type: PodType.VIRSH }),
      podFactory({ power_address: "172.0.0.1", type: PodType.LXD }),
      podFactory({ power_address: "172.0.0.1", type: PodType.LXD }),
      podFactory({ power_address: "192.168.0.1:8000", type: PodType.LXD }),
      podFactory({ power_address: "192.168.0.1:9000", type: PodType.LXD }),
    ];
    const state = rootStateFactory({
      pod: podStateFactory({
        items,
      }),
    });
    expect(pod.getByLxdServer(state, "172.0.0.1")).toStrictEqual([
      items[1],
      items[2],
    ]);
  });
});
