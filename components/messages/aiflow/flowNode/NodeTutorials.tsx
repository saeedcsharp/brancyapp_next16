import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../../../i18n";

export interface TutorialContent {
  title?: string;
  description?: string;
  image?: string;
  features?: string[];
  tips?: string[];
  limitations?: string[];
  usageType?: string;
  connections?: string[];
}

export const getNodeTutorials = (t: any): Record<string, TutorialContent> => ({
  onmessage: {
    title: t(LanguageKey.New_Flow_Tutorials_onmessage_title),
    description: t(LanguageKey.New_Flow_Tutorials_onmessage_description),
    features: [t(LanguageKey.New_Flow_Tutorials_onmessage_feature_1)],
    tips: [t(LanguageKey.New_Flow_Tutorials_onmessage_tip_1)],
    connections: [
      t(LanguageKey.New_Flow_Tutorials_onmessage_connection_1),
      t(LanguageKey.New_Flow_Tutorials_onmessage_connection_2),
      t(LanguageKey.New_Flow_Tutorials_onmessage_connection_3),
      t(LanguageKey.New_Flow_Tutorials_onmessage_connection_4),
      t(LanguageKey.New_Flow_Tutorials_onmessage_connection_5),
      t(LanguageKey.New_Flow_Tutorials_onmessage_connection_6),
    ],
  },

  text: {
    title: t(LanguageKey.New_Flow_Tutorials_text_title),
    description: t(LanguageKey.New_Flow_Tutorials_text_description),
    usageType: t(LanguageKey.New_Flow_Tutorials_text_usageType),
    features: [t(LanguageKey.New_Flow_Tutorials_text_feature_1), t(LanguageKey.New_Flow_Tutorials_text_feature_2)],
    tips: [
      t(LanguageKey.New_Flow_Tutorials_text_tip_1),
      t(LanguageKey.New_Flow_Tutorials_text_tip_2),
      t(LanguageKey.New_Flow_Tutorials_text_tip_3),
      t(LanguageKey.New_Flow_Tutorials_text_tip_4),
      t(LanguageKey.New_Flow_Tutorials_text_tip_5),
    ],
    limitations: [
      t(LanguageKey.New_Flow_Tutorials_text_limitation_1),
      t(LanguageKey.New_Flow_Tutorials_text_limitation_2),
      t(LanguageKey.New_Flow_Tutorials_text_limitation_3),
    ],
    connections: [
      t(LanguageKey.New_Flow_Tutorials_text_connection_1),
      t(LanguageKey.New_Flow_Tutorials_text_connection_2),
      t(LanguageKey.New_Flow_Tutorials_text_connection_3),
      t(LanguageKey.New_Flow_Tutorials_text_connection_4),
      t(LanguageKey.New_Flow_Tutorials_text_connection_5),
      t(LanguageKey.New_Flow_Tutorials_text_connection_6),
      t(LanguageKey.New_Flow_Tutorials_text_connection_7),
      t(LanguageKey.New_Flow_Tutorials_text_connection_8),
    ],
  },

  image: {
    title: t(LanguageKey.New_Flow_Tutorials_image_title),
    description: t(LanguageKey.New_Flow_Tutorials_image_description),
    usageType: t(LanguageKey.New_Flow_Tutorials_image_usageType),
    features: [
      t(LanguageKey.New_Flow_Tutorials_image_feature_1),
      t(LanguageKey.New_Flow_Tutorials_image_feature_2),
      t(LanguageKey.New_Flow_Tutorials_image_feature_3),
    ],
    tips: [
      t(LanguageKey.New_Flow_Tutorials_image_tip_1),
      t(LanguageKey.New_Flow_Tutorials_image_tip_2),
      t(LanguageKey.New_Flow_Tutorials_image_tip_3),
      t(LanguageKey.New_Flow_Tutorials_image_tip_4),
      t(LanguageKey.New_Flow_Tutorials_image_tip_5),
    ],
    limitations: [
      t(LanguageKey.New_Flow_Tutorials_image_limitation_1),
      t(LanguageKey.New_Flow_Tutorials_image_limitation_2),
      t(LanguageKey.New_Flow_Tutorials_image_limitation_3),
    ],
    connections: [
      t(LanguageKey.New_Flow_Tutorials_image_connection_1),
      t(LanguageKey.New_Flow_Tutorials_image_connection_2),
      t(LanguageKey.New_Flow_Tutorials_image_connection_3),
      t(LanguageKey.New_Flow_Tutorials_image_connection_4),
      t(LanguageKey.New_Flow_Tutorials_image_connection_5),
      t(LanguageKey.New_Flow_Tutorials_image_connection_6),
      t(LanguageKey.New_Flow_Tutorials_image_connection_7),
      t(LanguageKey.New_Flow_Tutorials_image_connection_8),
    ],
  },

  voice: {
    title: t(LanguageKey.New_Flow_Tutorials_voice_title),
    description: t(LanguageKey.New_Flow_Tutorials_voice_description),
    usageType: t(LanguageKey.New_Flow_Tutorials_voice_usageType),
    features: [
      t(LanguageKey.New_Flow_Tutorials_voice_feature_1),
      t(LanguageKey.New_Flow_Tutorials_voice_feature_2),
      t(LanguageKey.New_Flow_Tutorials_voice_feature_3),
    ],
    tips: [
      t(LanguageKey.New_Flow_Tutorials_voice_tip_1),
      t(LanguageKey.New_Flow_Tutorials_voice_tip_2),
      t(LanguageKey.New_Flow_Tutorials_voice_tip_3),
      t(LanguageKey.New_Flow_Tutorials_voice_tip_4),
    ],
    limitations: [
      t(LanguageKey.New_Flow_Tutorials_voice_limitation_1),
      t(LanguageKey.New_Flow_Tutorials_voice_limitation_2),
      t(LanguageKey.New_Flow_Tutorials_voice_limitation_3),
    ],
    connections: [
      t(LanguageKey.New_Flow_Tutorials_voice_connection_1),
      t(LanguageKey.New_Flow_Tutorials_voice_connection_2),
      t(LanguageKey.New_Flow_Tutorials_voice_connection_3),
      t(LanguageKey.New_Flow_Tutorials_voice_connection_4),
      t(LanguageKey.New_Flow_Tutorials_voice_connection_5),
      t(LanguageKey.New_Flow_Tutorials_voice_connection_6),
      t(LanguageKey.New_Flow_Tutorials_voice_connection_7),
      t(LanguageKey.New_Flow_Tutorials_voice_connection_8),
    ],
  },

  quickreply: {
    title: t(LanguageKey.New_Flow_Tutorials_quickreply_title),
    description: t(LanguageKey.New_Flow_Tutorials_quickreply_description),
    usageType: t(LanguageKey.New_Flow_Tutorials_quickreply_usageType),
    features: [
      t(LanguageKey.New_Flow_Tutorials_quickreply_feature_1),
      t(LanguageKey.New_Flow_Tutorials_quickreply_feature_2),
      t(LanguageKey.New_Flow_Tutorials_quickreply_feature_3),
    ],
    tips: [
      t(LanguageKey.New_Flow_Tutorials_quickreply_tip_1),
      t(LanguageKey.New_Flow_Tutorials_quickreply_tip_2),
      t(LanguageKey.New_Flow_Tutorials_quickreply_tip_3),
      t(LanguageKey.New_Flow_Tutorials_quickreply_tip_4),
      t(LanguageKey.New_Flow_Tutorials_quickreply_tip_5),
    ],
    limitations: [
      t(LanguageKey.New_Flow_Tutorials_quickreply_limitation_1),
      t(LanguageKey.New_Flow_Tutorials_quickreply_limitation_2),
      t(LanguageKey.New_Flow_Tutorials_quickreply_limitation_3),
      t(LanguageKey.New_Flow_Tutorials_quickreply_limitation_4),
    ],
    connections: [
      t(LanguageKey.New_Flow_Tutorials_quickreply_connection_1),
      t(LanguageKey.New_Flow_Tutorials_quickreply_connection_2),
      t(LanguageKey.New_Flow_Tutorials_quickreply_connection_3),
      t(LanguageKey.New_Flow_Tutorials_quickreply_connection_4),
      t(LanguageKey.New_Flow_Tutorials_quickreply_connection_5),
      t(LanguageKey.New_Flow_Tutorials_quickreply_connection_6),
      t(LanguageKey.New_Flow_Tutorials_quickreply_connection_7),
      t(LanguageKey.New_Flow_Tutorials_quickreply_connection_8),
    ],
  },

  generic: {
    title: t(LanguageKey.New_Flow_Tutorials_generic_title),
    description: t(LanguageKey.New_Flow_Tutorials_generic_description),
    usageType: t(LanguageKey.New_Flow_Tutorials_generic_usageType),
    tips: [
      t(LanguageKey.New_Flow_Tutorials_generic_tip_1),
      t(LanguageKey.New_Flow_Tutorials_generic_tip_2),
      t(LanguageKey.New_Flow_Tutorials_generic_tip_3),
      t(LanguageKey.New_Flow_Tutorials_generic_tip_4),
    ],
    limitations: [t(LanguageKey.New_Flow_Tutorials_generic_limitation_1)],
    connections: [
      t(LanguageKey.New_Flow_Tutorials_generic_connection_1),
      t(LanguageKey.New_Flow_Tutorials_generic_connection_2),
      t(LanguageKey.New_Flow_Tutorials_generic_connection_3),
      t(LanguageKey.New_Flow_Tutorials_generic_connection_4),
      t(LanguageKey.New_Flow_Tutorials_generic_connection_5),
      t(LanguageKey.New_Flow_Tutorials_generic_connection_6),
      t(LanguageKey.New_Flow_Tutorials_generic_connection_7),
    ],
  },

  genericitem: {
    title: t(LanguageKey.New_Flow_Tutorials_genericitem_title),
    description: t(LanguageKey.New_Flow_Tutorials_genericitem_description),
    usageType: t(LanguageKey.New_Flow_Tutorials_genericitem_usageType),
    features: [
      t(LanguageKey.New_Flow_Tutorials_genericitem_feature_1),
      t(LanguageKey.New_Flow_Tutorials_genericitem_feature_2),
      t(LanguageKey.New_Flow_Tutorials_genericitem_feature_3),
      t(LanguageKey.New_Flow_Tutorials_genericitem_feature_4),
    ],
    tips: [
      t(LanguageKey.New_Flow_Tutorials_genericitem_tip_1),
      t(LanguageKey.New_Flow_Tutorials_genericitem_tip_2),
      t(LanguageKey.New_Flow_Tutorials_genericitem_tip_3),
      t(LanguageKey.New_Flow_Tutorials_genericitem_tip_4),
      t(LanguageKey.New_Flow_Tutorials_genericitem_tip_5),
    ],
    limitations: [
      t(LanguageKey.New_Flow_Tutorials_genericitem_limitation_1),
      t(LanguageKey.New_Flow_Tutorials_genericitem_limitation_2),
      t(LanguageKey.New_Flow_Tutorials_genericitem_limitation_3),
      t(LanguageKey.New_Flow_Tutorials_genericitem_limitation_4),
      t(LanguageKey.New_Flow_Tutorials_genericitem_limitation_5),
      t(LanguageKey.New_Flow_Tutorials_genericitem_limitation_6),
    ],
    connections: [
      t(LanguageKey.New_Flow_Tutorials_genericitem_connection_1),
      t(LanguageKey.New_Flow_Tutorials_genericitem_connection_2),
      t(LanguageKey.New_Flow_Tutorials_genericitem_connection_3),
      t(LanguageKey.New_Flow_Tutorials_genericitem_connection_4),
      t(LanguageKey.New_Flow_Tutorials_genericitem_connection_5),
      t(LanguageKey.New_Flow_Tutorials_genericitem_connection_6),
    ],
  },

  weblink: {
    title: t(LanguageKey.New_Flow_Tutorials_weblink_title),
    description: t(LanguageKey.New_Flow_Tutorials_weblink_description),
    usageType: t(LanguageKey.New_Flow_Tutorials_weblink_usageType),
    features: [
      t(LanguageKey.New_Flow_Tutorials_weblink_feature_1),
      t(LanguageKey.New_Flow_Tutorials_weblink_feature_2),
    ],
    tips: [
      t(LanguageKey.New_Flow_Tutorials_weblink_tip_1),
      t(LanguageKey.New_Flow_Tutorials_weblink_tip_2),
      t(LanguageKey.New_Flow_Tutorials_weblink_tip_3),
      t(LanguageKey.New_Flow_Tutorials_weblink_tip_4),
      t(LanguageKey.New_Flow_Tutorials_weblink_tip_5),
    ],
    limitations: [
      t(LanguageKey.New_Flow_Tutorials_weblink_limitation_1),
      t(LanguageKey.New_Flow_Tutorials_weblink_limitation_2),
      t(LanguageKey.New_Flow_Tutorials_weblink_limitation_3),
    ],
    connections: [
      t(LanguageKey.New_Flow_Tutorials_weblink_connection_1),
      t(LanguageKey.New_Flow_Tutorials_weblink_connection_2),
    ],
  },
});

export const getTutorialContent = (nodeType: string, t: any): TutorialContent | null => {
  const nodeTutorials = getNodeTutorials(t);
  return nodeTutorials[nodeType] || null;
};

interface TutorialModalContentProps {
  nodeType: string;
  onClose: () => void;
}

export const TutorialModalContent: React.FC<TutorialModalContentProps> = ({ nodeType, onClose }) => {
  const { t } = useTranslation();
  const tutorial = getTutorialContent(nodeType, t);

  if (!tutorial) {
    return (
      <div className="headerandinput">
        <h2 className="title">{t(LanguageKey.New_Flow_Tutorials_Not_Available)}</h2>
        <p className="explain" style={{ lineHeight: "normal" }}>
          {t(LanguageKey.New_Flow_Tutorials_Not_Available_Description)}
        </p>
        <div className="ButtonContainer">
          <button className="cancelButton" onClick={onClose}>
            {t(LanguageKey.close)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="title">{tutorial.title}</h2>
      <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          gap: "30px",
          display: "flex",
          flexDirection: "column",
        }}>
        <div className="headerandinput">
          <p className="explain" style={{ lineHeight: "normal" }}>
            {tutorial.description}
          </p>
        </div>
        {tutorial.image && (
          <img src={tutorial.image} alt={tutorial.title} style={{ maxWidth: "100%", borderRadius: "8px" }} />
        )}
        {tutorial.usageType && (
          <div className="headerandinput">
            <h3 className="title">{t(LanguageKey.New_Flow_Tutorials_Usage_Type)}</h3>
            <p className="explain" style={{ lineHeight: "normal" }}>
              {tutorial.usageType}
            </p>
          </div>
        )}
        {tutorial.features && tutorial.features.length > 0 && (
          <div className="headerandinput">
            <h3 className="title">{t(LanguageKey.New_Flow_Tutorials_Features)}</h3>
            <ul className="explain" style={{ lineHeight: "normal" }}>
              {tutorial.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        {tutorial.tips && tutorial.tips.length > 0 && (
          <div className="headerandinput">
            <h3 className="title">{t(LanguageKey.New_Flow_Tutorials_Tips)}</h3>
            <ul className="explain" style={{ lineHeight: "normal" }}>
              {tutorial.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        {tutorial.limitations && tutorial.limitations.length > 0 && (
          <div className="headerandinput">
            <h3 className="title">{t(LanguageKey.New_Flow_Tutorials_Limitations)}</h3>
            <ul className="explain" style={{ lineHeight: "normal" }}>
              {tutorial.limitations.map((limitation, index) => (
                <li key={index}>{limitation}</li>
              ))}
            </ul>
          </div>
        )}
        {tutorial.connections && tutorial.connections.length > 0 && (
          <div className="headerandinput">
            <h3 className="title">{t(LanguageKey.New_Flow_Tutorials_Connections)}</h3>
            <ul className="explain" style={{ lineHeight: "normal" }}>
              {tutorial.connections.map((connection, index) => (
                <li key={index}>{connection}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="ButtonContainer">
        <button className="cancelButton" onClick={onClose}>
          {t(LanguageKey.close)}
        </button>
      </div>
    </>
  );
};
