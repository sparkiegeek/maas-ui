import { useCallback, useEffect, useState } from "react";

import { Spinner } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";

import AddKVMFormFields from "./AddKVMFormFields";

import { general as generalActions } from "app/base/actions";
import FormCard from "app/base/components/FormCard";
import FormCardButtons from "app/base/components/FormCardButtons";
import FormikForm from "app/base/components/FormikForm";
import { useAddMessage, useWindowTitle } from "app/base/hooks";
import type { TSFixMe } from "app/base/types";
import generalSelectors from "app/store/general/selectors";
import type { PowerType } from "app/store/general/types";
import { PowerFieldScope } from "app/store/general/types";
import {
  formatPowerParameters,
  generatePowerParametersSchema,
  useInitialPowerParameters,
} from "app/store/general/utils";
import { actions as podActions } from "app/store/pod";
import podSelectors from "app/store/pod/selectors";
import { actions as resourcePoolActions } from "app/store/resourcepool";
import resourcePoolSelectors from "app/store/resourcepool/selectors";
import { actions as zoneActions } from "app/store/zone";
import zoneSelectors from "app/store/zone/selectors";

export type AddKVMFormValues = { [x: string]: TSFixMe };

export const AddKVMForm = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const podSaved = useSelector(podSelectors.saved);
  const podSaving = useSelector(podSelectors.saving);
  const podErrors = useSelector(podSelectors.errors);
  const powerTypes = useSelector(generalSelectors.powerTypes.get);
  const powerTypesLoaded = useSelector(generalSelectors.powerTypes.loaded);
  const resourcePools = useSelector(resourcePoolSelectors.all);
  const resourcePoolsLoaded = useSelector(resourcePoolSelectors.loaded);
  const zones = useSelector(zoneSelectors.all);
  const zonesLoaded = useSelector(zoneSelectors.loaded);

  const [hostType, setHostType] = useState<PowerType>();
  const [savingPod, setSavingPod] = useState(false);

  const allLoaded = powerTypesLoaded && resourcePoolsLoaded && zonesLoaded;
  const initialHostType = "virsh";

  const cleanup = useCallback(() => podActions.cleanup(), []);

  // Fetch all data required for the form.
  useEffect(() => {
    dispatch(generalActions.fetchPowerTypes());
    dispatch(resourcePoolActions.fetch());
    dispatch(zoneActions.fetch());
  }, [dispatch]);

  // Set host type in component state once power types have loaded, in order to
  // be able to correctly format power parameters on form submit.
  useEffect(() => {
    const initialHostPowerType = powerTypes.find(
      (type: PowerType) => type.name === initialHostType
    );
    if (initialHostPowerType && !hostType) {
      setHostType(initialHostPowerType);
    }
  }, [hostType, powerTypes]);

  useWindowTitle("Add KVM");

  useAddMessage(podSaved, cleanup, `${savingPod} added successfully.`, () =>
    setSavingPod(false)
  );

  const initialPowerParameters = useInitialPowerParameters();
  const powerParametersSchema = generatePowerParametersSchema(hostType, [
    PowerFieldScope.BMC,
  ]);
  const AddKVMSchema = Yup.object().shape({
    name: Yup.string(),
    pool: Yup.string().required("Resource pool required"),
    power_parameters: Yup.object().shape(powerParametersSchema),
    type: Yup.string().required("KVM host type required"),
    zone: Yup.string().required("Zone required"),
  });

  return (
    <>
      {!allLoaded ? (
        <Spinner className="u-no-margin u-no-padding" text="Loading" />
      ) : (
        <FormCard sidebar={false} title="Add KVM">
          <FormikForm
            buttons={FormCardButtons}
            cleanup={cleanup}
            errors={podErrors}
            initialValues={{
              name: "",
              pool: resourcePools.length ? resourcePools[0].id : "",
              power_parameters: initialPowerParameters,
              type: initialHostType,
              zone: zones.length ? zones[0].id : "",
            }}
            onCancel={() => history.push({ pathname: "/kvm" })}
            onSaveAnalytics={{
              action: "Save",
              category: "KVM",
              label: "Add KVM form",
            }}
            onSubmit={(values: AddKVMFormValues) => {
              const params = {
                name: values.name,
                pool: values.pool,
                type: values.type,
                zone: values.zone,
                ...formatPowerParameters(hostType, values.power_parameters, [
                  PowerFieldScope.BMC,
                ]),
              };
              dispatch(podActions.create(params));
              setSavingPod(values.name || "VM host");
            }}
            onValuesChanged={(values: AddKVMFormValues) => {
              const hostType = powerTypes.find(
                (type: PowerType) => type.name === values.type
              );
              setHostType(hostType);
            }}
            saving={podSaving}
            saved={podSaved}
            savedRedirect="/kvm"
            submitLabel="Save KVM"
            validationSchema={AddKVMSchema}
          >
            <AddKVMFormFields />
          </FormikForm>
        </FormCard>
      )}
    </>
  );
};

export default AddKVMForm;
