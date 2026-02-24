import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { IMedia } from "brancy/models/messages/IMessage";
import chatBoxStyles from "brancy/components/messages/comment/commentChatBox.module.css";

interface CommentStatisticsProps {
  currentChatBox: IMedia;
  basePictureUrl: string | undefined;
}

const CommentStatistics: React.FC<CommentStatisticsProps> = ({ currentChatBox, basePictureUrl }) => {
  const { t } = useTranslation();
  const safePictureUrl = basePictureUrl || "";

  return (
    <>
      <div className="headerparent">
        <div className="title2" id="total-comments">
          {t(LanguageKey.totalcomments)}
        </div>
        <div
          className={chatBoxStyles.commentcounter}
          style={{
            backgroundColor: "var(--color-dark-blue30)",
            color: "var(--color-dark-blue)",
          }}
          aria-labelledby="total-comments">
          {currentChatBox.comments.length}
        </div>
      </div>
      <div className="headerparent">
        <div className="title2" id="unanswered-comments">
          {t(LanguageKey.unansweredcomments)}
        </div>
        <div
          className={chatBoxStyles.commentcounter}
          style={{
            backgroundColor: "var(--color-dark-red30)",
            color: "var(--color-dark-red)",
          }}
          aria-labelledby="unanswered-comments">
          {currentChatBox.unAnsweredCount}
        </div>
      </div>

      <div className="headerparent">
        <div className="title2" id="total-commenters">
          {t(LanguageKey.totalcommenters)}
        </div>
        <div
          className={chatBoxStyles.commentcounter}
          style={{
            backgroundColor: "var(--color-gray30)",
            color: "var(--color-gray)",
          }}
          aria-labelledby="total-commenters">
          {new Set(currentChatBox.comments.map((comment) => comment.username)).size}
        </div>
      </div>

      <>
        {(() => {
          // Get unique commenters with their comment counts
          const commenters = currentChatBox.comments.reduce(
            (acc, comment) => {
              const username = comment.username;
              if (!acc[username]) {
                acc[username] = {
                  username,
                  fullName: comment.fullName ?? "",
                  profileUrl: comment.profileUrl,
                  count: 1,
                };
              } else {
                acc[username].count++;
              }
              return acc;
            },
            {} as Record<
              string,
              {
                username: string;
                fullName: string;
                profileUrl: string;
                count: number;
              }
            >,
          );

          // Convert to array and sort by comment count
          const sortedCommenters = Object.values(commenters)
            .sort((a, b) => b.count - a.count)
            .slice(0, 20); // Show first 20

          return (
            <div
              className={chatBoxStyles.commentersScroll}
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                if (target.scrollHeight - target.scrollTop === target.clientHeight) {
                  // Load next 20 commenters when scrolled to bottom
                  // Implementation depends on your needs
                }
              }}>
              {sortedCommenters.map((commenter) => (
                <div
                  key={commenter.username}
                  className={chatBoxStyles.commenterItem}
                  role="listitem"
                  aria-label={`Commenter ${commenter.username}`}>
                  <div className="instagramprofile" role="presentation">
                    <img
                      className="instagramimage"
                      alt={`${commenter.fullName}'s profile picture`}
                      src={safePictureUrl + commenter.profileUrl}
                      title={`${commenter.fullName}'s profile picture`}
                      width="40"
                      height="40"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className="instagramprofiledetail" role="contentinfo">
                      <div className="instagramusername" aria-label="Full name">
                        {commenter.fullName}
                      </div>
                      <div className="instagramid" aria-label="Username">
                        @{commenter.username}
                      </div>
                    </div>
                  </div>
                  <div
                    className={chatBoxStyles.commentcounter}
                    style={{
                      backgroundColor: "var(--color-gray30)",
                      color: "var(--color-gray)",
                    }}
                    role="status"
                    title="Comment count"
                    aria-label={`Comment count: ${commenter.count}`}>
                    {commenter.count}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </>
    </>
  );
};

export default CommentStatistics;
