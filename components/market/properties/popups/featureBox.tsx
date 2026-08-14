import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import EditBusinessHours from "brancy/components/market/properties/popups/editBusinessHours";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import Loading from "brancy/components/notOk/loading";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { LanguageKey } from "brancy/i18n";
import { BusinessDay } from "brancy/models/enums";
import { IBusinessHour } from "brancy/models/interfaces";
import styles from "./featureBoxPU.module.css";

export default function FeaturesBoxPopup(props: { removeMask: () => void }) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [selectedSection, setSelectedSection] = useState(ToggleOrder.FirstToggle);
  const [businessHours, setBusinessHours] = useState<IBusinessHour[] | null>(null);
  const [terms, setTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchFeatureBoxData() {
      const instagramerId = session?.user?.instagramerIds?.[session.user.currentIndex];
      if (!instagramerId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const [workingHoursResult, termsResult] = await Promise.all([
          clientFetchApi<undefined, IBusinessHour[]>("/Instagramer/Bio/GetWorkingHours", {
            methodType: MethodType.get,
            session,
            data: undefined,
            queries: undefined,
            onUploadProgress: undefined,
          }),
          clientFetchApi<undefined, string[]>("/Instagramer/Bio/GetTermsAndCondtions", {
            methodType: MethodType.get,
            session,
            data: undefined,
            queries: undefined,
            onUploadProgress: undefined,
          }),
        ]);

        if (!workingHoursResult.succeeded) {
          notify(workingHoursResult.info.responseType, NotifType.Warning);
        }
        if (!termsResult.succeeded) {
          notify(termsResult.info.responseType, NotifType.Warning);
        }
        if (!isMounted) return;

        const hours = Array.isArray(workingHoursResult.value)
          ? workingHoursResult.value.map((item) => ({
              ...item,
              weekday: (item as IBusinessHour & { weekDay?: BusinessDay }).weekDay ?? item.weekday,
            }))
          : [];
        setBusinessHours(
          Array.from(
            { length: 7 },
            (_, weekday) =>
              hours.find((item) => item.weekday === weekday) ?? {
                instagramerId: Number(instagramerId),
                weekday: weekday as BusinessDay,
                beginTime: 0,
                endTime: 0,
              },
          ),
        );
        setTerms(Array.isArray(termsResult.value) ? termsResult.value : []);
      } catch {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFeatureBoxData();
    return () => {
      isMounted = false;
    };
  }, [session]);

  async function saveBusinessHour(info: IBusinessHour[]) {
    try {
      const result = await clientFetchApi<IBusinessHour[], boolean>("/Instagramer/Bio/UpdateWorkingHours", {
        methodType: MethodType.post,
        session,
        data: info,
        queries: undefined,
        onUploadProgress: undefined,
      });

      if (!result.succeeded) {
        notify(result.info.responseType, NotifType.Warning);
        return;
      }

      setBusinessHours(info);
      props.removeMask();
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  if (loading || !businessHours) return <Loading />;

  return (
    <>
      <ToggleButton
        options={[
          { id: ToggleOrder.FirstToggle, label: t(LanguageKey.marketProperties_yourBusinesshours) },
          { id: ToggleOrder.SecondToggle, label: t(LanguageKey.marketProperties_BusinessTerms) },
        ]}
        selectedValue={selectedSection}
        onChange={setSelectedSection}
        ariaLabel="Feature box sections"
      />
      {selectedSection === ToggleOrder.FirstToggle ? (
        <EditBusinessHours
          businessInfo={businessHours}
          removeMask={props.removeMask}
          saveBusinessHour={saveBusinessHour}
        />
      ) : (
        <section className={styles.terms} aria-label={t(LanguageKey.marketProperties_BusinessTerms)}>
          {terms.length > 0 ? (
            <ol>
              {terms.map((term, index) => (
                <li key={`${term}-${index}`}>{term}</li>
              ))}
            </ol>
          ) : (
            <p>{t(LanguageKey.marketProperties_BusinessTermsExplain)}</p>
          )}
        </section>
      )}
    </>
  );
}
