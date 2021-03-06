import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import NameColumn from "./NameColumn";

import type { RootState } from "app/store/root/types";
import {
  pod as podFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("NameColumn", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory();
  });

  it("can display a link to details page", () => {
    const state = { ...initialState };
    state.pod.items = [podFactory({ id: 1, name: "pod-1" })];
    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm", key: "testKey" }]}>
          <NameColumn id={1} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Link").text()).toBe("pod-1");
    expect(wrapper.find("Link").props().to).toBe("/kvm/1");
  });
});
