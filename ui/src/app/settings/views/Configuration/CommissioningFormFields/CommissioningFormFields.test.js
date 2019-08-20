import { mount } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import CommissioningFormFields from "./CommissioningFormFields";

const mockStore = configureStore();

describe("CommissioningFormFields", () => {
  let baseFormikProps;
  let initialState;
  let baseValues = {
    default_distro_series: "bionic",
    default_min_hwe_kernel: "ga-16.04-lowlatency"
  };

  beforeEach(() => {
    baseFormikProps = {
      errors: {},
      handleBlur: jest.fn(),
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
      initialValues: { ...baseValues },
      touched: {},
      values: { ...baseValues }
    };
    initialState = {
      config: {
        loading: false,
        loaded: true,
        items: [
          {
            name: "default_distro_series",
            value: "bionic",
            choices: [
              ["precise", 'Ubuntu 12.04 LTS "Precise Pangolin"'],
              ["trusty", 'Ubuntu 14.04 LTS "Trusty Tahr"'],
              ["xenial", 'Ubuntu 16.04 LTS "Xenial Xerus"'],
              ["bionic", 'Ubuntu 18.04 LTS "Bionic Beaver"']
            ]
          },
          {
            name: "default_min_hwe_kernel",
            value: "ga-16.04-lowlatency",
            choices: [
              ["", "--- No minimum kernel ---"],
              ["ga-16.04-lowlatency", "xenial (ga-16.04-lowlatency)"],
              ["ga-16.04", "xenial (ga-16.04)"],
              ["hwe-16.04-lowlatency", "xenial (hwe-16.04-lowlatency)"],
              ["hwe-16.04", "xenial (hwe-16.04)"],
              ["hwe-16.04-edge", "xenial (hwe-16.04-edge)"],
              [
                "hwe-16.04-lowlatency-edge",
                "xenial (hwe-16.04-lowlatency-edge)"
              ]
            ]
          }
        ]
      }
    };
  });

  it("updates value for default distro series", () => {
    const state = { ...initialState };
    const formikProps = { ...baseFormikProps };
    formikProps.values.default_distro_series = "trusty";
    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <CommissioningFormFields formikProps={formikProps} />
      </Provider>
    );

    expect(
      wrapper
        .find("[name='default_distro_series']")
        .first()
        .props().value
    ).toBe("trusty");
  });

  it("updates value for default min kernel", () => {
    const state = { ...initialState };
    const formikProps = { ...baseFormikProps };
    formikProps.values.default_min_hwe_kernel = "hwe-16.04-edge";
    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <CommissioningFormFields formikProps={formikProps} />
      </Provider>
    );

    expect(
      wrapper
        .find("[name='default_min_hwe_kernel']")
        .first()
        .props().value
    ).toBe("hwe-16.04-edge");
  });
});