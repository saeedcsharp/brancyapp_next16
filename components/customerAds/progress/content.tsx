import { useRouter } from "next/router";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import DragComponent, { positionType } from "brancy/components/design/dragComponent/dragComponent";
import InputText from "brancy/components/design/inputText";
import TextArea from "brancy/components/design/textArea/textArea";
import { MethodType } from "brancy/helper/api";
import styles from "./progress.module.css";
import styles2 from "./components/customerAds/progress/uploadContent.module.css";

import { useSession } from "next-auth/react";
import Head from "next/head";
import { convertHeicToJpeg } from "brancy/helper/convertHeicToJPEG";
import { IPageInfo, IShowMedia } from "brancy/models/customerAds/customerAd";
import { MediaType, PostType } from "brancy/models/page/post/preposts";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
function Content(props: {
  handleUpdateContent: (content: IShowMedia[], caption: string) => void;
  data: IShowMedia[];
  caption: string;
}) {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputCoverRef = useRef<HTMLInputElement | null>(null);
  const inputReplaceRef = useRef<HTMLInputElement | null>(null);
  const [renderWidthSize, setRenderwidthSize] = useState(333);
  const [captionTextArea, setCaptionTextArea] = useState(props.caption);
  const [hashtagsWord, setHashtagsWord] = useState<string[]>([]);
  const [showMedias, setShowMedias] = useState<IShowMedia[]>(props.data);
  const [postType, setPostType] = useState<PostType>(props.data.length > 0 ? PostType.Album : PostType.Single);
  const [showMediaIndex, setShowMediaIndex] = useState(0);
  const [searchPeaple, setSearchPeaple] = useState("");
  const [pageInfo, setPageInfo] = useState<IPageInfo[]>([]);
  const [showAddPeapleBox, setShowAddPeapleBox] = useState(true);
  const [selectedPeaple, setSelectedPeaple] = useState<IPageInfo | null>(null);
  const [peopleTimeOutId, setPeopleTimeOutId] = useState<any>();
  const [peopleLocked, setPeopleLocked] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [inputLink, setInputLink] = useState<string>("");
  const [firstLoaded, setFirstLoaded] = useState(true);
  const handleApiPeopleSearch = async (query: string) => {
    try {
      var instagramerId = session?.user.instagramerIds[session.user.currentIndex];
      console.log("start searched people ", query);
      var res = await clientFetchApi<boolean, IPageInfo[]>("Instagramer" + "/searchPeople", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "query", value: query }],
        onUploadProgress: undefined,
      });
      console.log(res);
      if (res.succeeded) setPageInfo(res.value);
    } catch {}
  };
  const handlePasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputLink(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };
  const handleSearchPeopleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setShowAddPeapleBox(true);
    setPageInfo([]);
    setSelectedPeaple(null);
    var query = e.currentTarget.value;
    // setPeopleTypingStopped(false);
    setSearchPeaple(query);
    if (peopleTimeOutId) clearTimeout(peopleTimeOutId);
    if (query.length > 0) {
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (peopleLocked) return;
          setPeopleLocked(true);
          handleApiPeopleSearch(query);
          setTimeout(() => {
            setPeopleLocked(false);
          }, 2000);
        }
      }, 1000);
      setPeopleTimeOutId(timeOutId);
    }
  };
  const handleChangeCaptionTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    var value = e.target.value;
    const hashtagMatches = value.match(/#\S+/g);

    if (hashtagMatches) {
      setHashtagsWord(hashtagMatches);
    } else {
      setHashtagsWord([]);
    }
    setCaptionTextArea(value);
  };
  const handleKeyDownCaptionTextarea = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (hashtagsWord?.length > 31 && e.key === "#") {
      e.preventDefault();
    }
  };
  const handleSelectAlbumMedia = async (e: ChangeEvent<HTMLInputElement>) => {
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;
    if (file) {
      // You can display a preview of the selected image if needed.
      const reader = new FileReader();
      reader.onload = () => {
        var selectedMedia1 = reader.result as string;
        //Api to upload media with selectedMedia
        //get response as IShowMedia type
        var medias = showMedias;

        var medias = showMedias;
        let mediaType: MediaType;
        if (file === undefined) return;
        console.log("handleSelectSingleMedia", file.type);
        if (file.type == "image/jpeg") {
          mediaType = MediaType.Image;
          const img = new Image();
          img.onload = () => {
            const width = img.width;
            const height = img.height;
            medias.push({
              error: "",
              mediaType: mediaType,
              media: selectedMedia1,
              tagPeaple: [],
              cover: "",
              width: width,
              height: height,
            });
            setShowMedias(medias);
            setShowMediaIndex(medias.length - 1);
            setRefresh(!refresh);
          };
          img.src = selectedMedia1;
        } else if (file.type == "video/mp4") {
          mediaType = MediaType.Video;

          const video = document.createElement("video");
          video.onloadedmetadata = () => {
            const width = video.videoWidth;
            const height = video.videoHeight;

            medias.push({
              error: "",
              mediaType: mediaType,
              media: selectedMedia1,
              tagPeaple: [],
              cover: "",
              height: width,
              width: height,
            });
            setShowMedias(medias);
            setShowMediaIndex(medias.length - 1);
            setRefresh(!refresh);
          };
          video.src = selectedMedia1;
        } else {
          console.log("Invalid MediaType");
          return;
        }
      };
      reader.readAsDataURL(file);
      console.log("fffffffffffff ", inputRef);
    }
  };
  const handleSelectSingleMedia = async (e: ChangeEvent<HTMLInputElement>) => {
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;
    if (file) {
      // You can display a preview of the selected image if needed.
      const reader = new FileReader();
      reader.onload = () => {
        var selectedMedia1 = reader.result as string;
        //Api to upload media with selectedMedia
        //get response as IShowMedia type
        var medias = showMedias;
        let mediaType: MediaType;
        if (file === undefined) return;
        console.log("handleSelectSingleMedia", file.type);
        if (file.type == "image/jpeg") {
          mediaType = MediaType.Image;
          const img = new Image();
          img.onload = () => {
            const width = img.width;
            const height = img.height;
            medias[0] = {
              error: "",
              mediaType: mediaType,
              media: selectedMedia1,
              tagPeaple: [],
              cover: "",
              width: width,
              height: height,
            };
            setShowMedias(medias);
            setShowMediaIndex(medias.length - 1);
            setRefresh(!refresh);
          };
          img.src = selectedMedia1;
        } else if (file.type == "video/mp4") {
          mediaType = MediaType.Video;

          const video = document.createElement("video");
          video.onloadedmetadata = () => {
            const width = video.videoWidth;
            const height = video.videoHeight;

            medias[0] = {
              error: "",
              mediaType: mediaType,
              media: selectedMedia1,
              tagPeaple: [],
              cover: "",
              height: width,
              width: height,
            };
            setShowMedias(medias);
            setShowMediaIndex(medias.length - 1);
            setRefresh(!refresh);
          };
          video.src = selectedMedia1;
        } else {
          console.log("Invalid MediaType");
          return;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSelectCover = async (e: ChangeEvent<HTMLInputElement>) => {
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;
    if (file) {
      // You can display a preview of the selected image if needed.
      const reader = new FileReader();
      reader.onload = () => {
        var selectedMedia1 = reader.result as string;
        //Api to upload media with selectedMedia
        //get response as IShowMedia type
        var medias = showMedias;
        medias[showMediaIndex].cover = selectedMedia1;
        setShowMedias(medias);
        setShowMediaIndex(showMediaIndex);
        // setRefresh(!refresh);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleReplaceMedia = async (e: ChangeEvent<HTMLInputElement>) => {
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;
    if (file) {
      // You can display a preview of the selected image if needed.
      const reader = new FileReader();
      reader.onload = () => {
        var selectedMedia1 = reader.result as string;
        //Api to upload media with selectedMedia
        //get response as IShowMedia type
        var medias = showMedias;
        let mediaType: MediaType;
        if (file === undefined) return;
        if (file === undefined) return;
        console.log("handleSelectSingleMedia", file.type);
        if (file.type == "image/jpeg") {
          mediaType = MediaType.Image;
          const img = new Image();
          img.onload = () => {
            const width = img.width;
            const height = img.height;
            medias[showMediaIndex] = {
              error: "",
              mediaType: mediaType,
              media: selectedMedia1,
              tagPeaple: [],
              cover: "",
              width: width,
              height: height,
            };
            setShowMedias(medias);
            setShowMediaIndex(medias.length - 1);
            setRefresh(!refresh);
          };
          img.src = selectedMedia1;
        } else if (file.type == "video/mp4") {
          mediaType = MediaType.Video;

          const video = document.createElement("video");
          video.onloadedmetadata = () => {
            const width = video.videoWidth;
            const height = video.videoHeight;

            medias[showMediaIndex] = {
              error: "",
              mediaType: mediaType,
              media: selectedMedia1,
              tagPeaple: [],
              cover: "",
              height: width,
              width: height,
            };
            setShowMedias(medias);
            setShowMediaIndex(medias.length - 1);
            setRefresh(!refresh);
          };
          video.src = selectedMedia1;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleChangeInputLink = (e: ChangeEvent<HTMLInputElement>) => {
    setInputLink(e.currentTarget.value);
  };
  const handleUploadImage = () => {
    const kemeMal = document.getElementById("add post");
    if (kemeMal) {
      kemeMal.click();
    }
    // console.log(inputRef);
    // if (inputRef.current) {
    //   inputRef.current.click();
    // }
  };

  const handleUploadCoverImage = () => {
    var medias = showMedias;
    if (medias[showMediaIndex].mediaType !== MediaType.Video) return;
    if (inputCoverRef.current) {
      inputCoverRef.current.click();
    }
  };
  const handleUploadRepalceMedia = () => {
    if (inputReplaceRef.current) {
      inputReplaceRef.current.click();
    }
  };
  const handleDedleteMedia = () => {
    const medias = showMedias;
    medias.splice(showMediaIndex, 1);
    setShowMedias(medias);
    setShowMediaIndex(showMedias.length - 1);
    setRefresh(!refresh);
  };
  const handleSelectPage = (page: IPageInfo) => {
    setSelectedPeaple(page);
    setSearchPeaple(page.userName);
    setShowAddPeapleBox(false);
  };
  const handleTagPeaple = () => {
    setRefresh(!refresh);
    var nShowMedias = showMedias;
    var pk = nShowMedias[showMediaIndex].tagPeaple.find((x) => x.Pk === selectedPeaple?.pk);
    if (pk) return;
    if (selectedPeaple) {
      nShowMedias[showMediaIndex].tagPeaple.push({
        Pk: selectedPeaple.pk,
        Username: selectedPeaple.userName,
        X: 0.5,
        Y: 0.5,
      });
    }
    setShowMedias(nShowMedias);
  };
  const handleStopDrag = (username: string, position: positionType, deltaX: number, deltaY: number) => {
    var nShowMedias = showMedias;
    var currentShowMedia = showMedias[showMediaIndex];
    var indexCurrentTag = currentShowMedia.tagPeaple?.findIndex((x) => x.Username === username);
    var currentTag = currentShowMedia.tagPeaple?.find((x) => x.Username === username);
    if (currentTag) {
      let minX =
        showMedias[showMediaIndex].width < showMedias[showMediaIndex].height
          ? renderWidthSize * (0.5 - (0.5 * showMedias[showMediaIndex].width) / showMedias[showMediaIndex].height)
          : 0;
      let maxX =
        showMedias[showMediaIndex].width < showMedias[showMediaIndex].height
          ? renderWidthSize * (0.5 + (0.5 * showMedias[showMediaIndex].width) / showMedias[showMediaIndex].height)
          : renderWidthSize;
      let minY =
        showMedias[showMediaIndex].height < showMedias[showMediaIndex].width
          ? renderWidthSize * (0.5 - (0.5 * showMedias[showMediaIndex].height) / showMedias[showMediaIndex].width)
          : 0;
      let maxY =
        showMedias[showMediaIndex].height < showMedias[showMediaIndex].width
          ? renderWidthSize * (0.5 + (0.5 * showMedias[showMediaIndex].height) / showMedias[showMediaIndex].width)
          : renderWidthSize;
      console.log("maxY-MinY", maxY - minY);
      console.log("Position", position);
      let _x = (position.x + deltaX - minX) / (maxX - minX);
      let _y = (position.y + deltaY - minY) / (maxY - minY);
      console.log("Current position ", username, _x, _y);
      if (_x < 0) _x = 0;
      if (_x > 1) _x = 1;
      if (_y < 0) _y = 0;
      if (_y > 1) _y = 1;
      currentTag.X = _x;
      currentTag.Y = _y;

      currentShowMedia.tagPeaple[indexCurrentTag] = currentTag;
      nShowMedias[showMediaIndex] = currentShowMedia;
      setShowMedias(nShowMedias);
      setRefresh(!refresh);
    }
    console.log(showMedias);
  };
  const handleChangeAlbumChildren = (index: number) => {
    setShowMediaIndex(index);
    // var nTagPeaples = showMedias[index].tagPeaple;
    // if (nTagPeaples) {
    //   setRefresh(!refresh);
    // }
  };
  const handleDeleteTag = (username: string) => {
    var nShowMedias = showMedias;
    var currentShowMedia = showMedias[showMediaIndex];
    var nTags = showMedias[showMediaIndex].tagPeaple?.filter((X) => X.Username !== username);
    console.log(nTags);
    currentShowMedia.tagPeaple = nTags;
    nShowMedias[showMediaIndex] = currentShowMedia;
    setShowMedias(nShowMedias);
    setRefresh(!refresh);
  };

  const divArray = Array.from({ length: 9 - (showMedias ? showMedias.length : 0) }, (_, index) => (
    <div key={index} className={styles.posts1}></div>
  ));
  const disableDivArray = Array.from({ length: 9 }, (_, index) => (
    <div key={index} className={styles.disablePosts1}></div>
  ));

  useEffect(() => {
    if (!firstLoaded) props.handleUpdateContent(showMedias, captionTextArea);
    setFirstLoaded(false);
  }, [refresh, captionTextArea]);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ 📤 Upload Content</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className={styles.stepcontainer1}>
        <div className={styles.right}>
          <div className="headerandinput" style={{ maxWidth: "350px" }}>
            <div className="headertext">upload instagram link</div>

            <div className="ButtonContainer" style={{ height: "40px" }}>
              <InputText
                className={"textinputbox"}
                placeHolder={"insert link"}
                handleInputChange={handleChangeInputLink}
                value={inputLink}
                maxLength={undefined}
                name=""
              />
              <div
                title="ℹ️ paste link"
                className="saveButton"
                style={{
                  maxWidth: "40px",
                  maxHeight: "40px",
                }}
                onClick={handlePasteLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 25 24" fill="none">
                  <path
                    d="M24.17 14.64V6.14L18.04 0.01H16.24C14.54 0.01 12.84 0.01 11.07 0C9.57997 0.1 8.17997 0.72 7.08997 1.74C6.46997 2.3 5.97997 2.98 5.64997 3.75C4.22997 3.88 2.89997 4.48 1.85997 5.45C0.619973 6.49 -0.0700266 8.05 -2.65772e-05 9.66V18.41C0.0599734 20.05 0.789973 21.58 2.01997 22.66C3.02997 23.5 4.29997 23.97 5.60997 23.99H13.32C15.69 23.99 17.8 22.5 18.59 20.27C21.69 20.25 24.19 17.72 24.17 14.62V14.64ZM16.23 21.29C15.46 22.07 14.42 22.5 13.32 22.5H5.61997C4.65997 22.48 3.72997 22.14 2.98997 21.52C2.08997 20.73 1.54997 19.6 1.50997 18.4V9.67C1.44997 8.46 1.95997 7.3 2.89997 6.53C3.71997 5.77 4.77997 5.31 5.88997 5.22C7.57997 5.22 9.27997 5.23 10.99 5.24H12.17L17.41 10.48V17.04V18.37C17.42 19.46 16.99 20.51 16.22 21.29H16.23ZM18.9 18.75C18.9 18.62 18.94 18.49 18.94 18.36V9.85L12.81 3.73H11.01C9.79997 3.73 8.58997 3.73 7.35997 3.73C7.58997 3.4 7.85997 3.1 8.14997 2.83C8.96997 2.07 10.03 1.61 11.14 1.52C12.83 1.53 14.53 1.54 16.24 1.54H17.42L22.65 6.78V14.8C22.59 16.88 20.97 18.59 18.9 18.74V18.75ZM13.35 16.63C13.35 17.03 13.03 17.35 12.63 17.35H6.30997C5.90997 17.35 5.58997 17.03 5.58997 16.63C5.58997 16.23 5.90997 15.91 6.30997 15.91H12.63C13.03 15.91 13.35 16.23 13.35 16.63ZM13.35 12.4C13.35 12.8 13.03 13.12 12.63 13.12H6.30997C5.90997 13.12 5.58997 12.8 5.58997 12.4C5.58997 12 5.90997 11.68 6.30997 11.68H12.63C13.03 11.68 13.35 12 13.35 12.4Z"
                    fill="white"
                  />
                </svg>
              </div>
              {searchPeaple.length > 0 && showAddPeapleBox && (
                <div className={styles2.resultSearchmention}>
                  {pageInfo?.map((v) => (
                    <div onClick={() => handleSelectPage(v)} key={v.pk} className={styles2.searchContent}>
                      <img
                        loading="lazy"
                        decoding="async"
                        className={styles2.userProfile}
                        src={basePictureUrl + v.profilePicUrl}
                      />
                      <div className={styles2.username}>{v.userName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles2.cardPost}>
            {showMedias.length === 0 ? (
              <>
                <div className={styles2.picturenopost} onClick={handleUploadImage}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleSelectAlbumMedia}
                    ref={inputRef}
                    style={{ display: "none" }}
                  />
                  <img style={{ width: "60px" }} alt="plus" src="/icon-plus.svg" />

                  <div className="explain" style={{ textAlign: "center" }}>
                    supported format : <br></br>
                    <strong>Video (MP4), Image (JPG)</strong>
                    <br></br> <br></br>
                    limit size :<br></br>
                    <strong>Max 50MB each file</strong>
                  </div>
                </div>
              </>
            ) : (
              <>
                {showMedias[showMediaIndex].mediaType == MediaType.Image ||
                showMedias[showMediaIndex].coverUri ||
                showMedias[showMediaIndex].cover.length != 0 ? (
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles2.pictureMaskIcon}
                    alt="post"
                    src={
                      showMedias[showMediaIndex].mediaType == MediaType.Image
                        ? (showMedias[showMediaIndex].mediaUri ?? showMedias[showMediaIndex].media)
                        : (showMedias[showMediaIndex].coverUri ?? showMedias[showMediaIndex].cover)
                    }
                  />
                ) : (
                  <video className={styles2.pictureMaskIcon} src={showMedias[showMediaIndex].media} />
                )}

                <div className={styles2.filter} />
                {showMedias[showMediaIndex].tagPeaple?.map((v, i) => (
                  <div key={showMediaIndex * 1e20 + i + v.Pk}>
                    <DragComponent
                      key={i + "_" + v.Pk}
                      handleStopDrag={handleStopDrag}
                      handleDeleteTag={handleDeleteTag}
                      username={v.Username}
                      x={v.X * renderWidthSize}
                      y={renderWidthSize * v.Y}
                      minX={
                        showMedias[showMediaIndex].width < showMedias[showMediaIndex].height
                          ? renderWidthSize *
                            (0.5 - (0.5 * showMedias[showMediaIndex].width) / showMedias[showMediaIndex].height)
                          : 0
                      }
                      maxX={
                        showMedias[showMediaIndex].width < showMedias[showMediaIndex].height
                          ? renderWidthSize *
                            (0.5 + (0.5 * showMedias[showMediaIndex].width) / showMedias[showMediaIndex].height)
                          : renderWidthSize
                      }
                      minY={
                        showMedias[showMediaIndex].height < showMedias[showMediaIndex].width
                          ? renderWidthSize *
                            (0.5 - (0.5 * showMedias[showMediaIndex].height) / showMedias[showMediaIndex].width)
                          : 0
                      }
                      maxY={
                        showMedias[showMediaIndex].height < showMedias[showMediaIndex].width
                          ? renderWidthSize *
                            (0.5 + (0.5 * showMedias[showMediaIndex].height) / showMedias[showMediaIndex].width)
                          : renderWidthSize
                      }
                    />
                  </div>
                ))}
              </>
            )}
            <div className={styles2.optionCard}>
              <div className={showMedias.length > 0 ? styles2.cardPostChild : styles2.disableCardPostChild}>
                <div onClick={handleDedleteMedia} className={styles2.postoption}>
                  <svg className={styles2.postoptionicon} viewBox="0 0 21 24">
                    <path d="M20 4h-4.8v-.7A2.7 2.7 0 0 0 12.5.6H7.8a2.7 2.7 0 0 0-2.7 2.7v.8H.2a.8.8 0 0 0 0 1.5h1.1V21A3.6 3.6 0 0 0 5 24.6h10.4A3.6 3.6 0 0 0 19 21V5.6h1A.8.8 0 1 0 20 4M6.7 3.4a1.2 1.2 0 0 1 1.2-1.2h4.7a1.2 1.2 0 0 1 1.2 1.2v.8H6.6ZM17.5 21a2 2 0 0 1-2.1 2.1H5A2 2 0 0 1 2.8 21V5.6h14.7ZM6.7 18.4V9.9a.8.8 0 1 1 1.5 0v8.5a1 1 0 0 1-.8.7 1 1 0 0 1-.7-.7m5.6.5-.2-.5V9.9a.8.8 0 1 1 1.5 0v8.5a1 1 0 0 1-.8.7z" />
                  </svg>

                  <div className={styles2.postoptionicontext}>Delete</div>
                </div>

                <div
                  onClick={handleUploadCoverImage}
                  className={
                    showMedias.length > 0 && showMedias[showMediaIndex].mediaType === MediaType.Video
                      ? styles2.postoption
                      : styles2.disablePostOption
                  }>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleSelectCover}
                    ref={inputCoverRef}
                    style={{ display: "none" }}
                  />
                  <div className={styles2.new}>new</div>
                  <img className={styles2.postoptionicon} alt="cover" src="/cover.svg" />
                  <div className={styles2.postoptionicontext}>Cover</div>
                </div>

                <div onClick={handleUploadRepalceMedia} className={styles2.postoption}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleReplaceMedia}
                    ref={inputReplaceRef}
                    style={{ display: "none" }}
                  />
                  <img className={styles2.postoptionicon} alt="replace" src="/replace.svg" />
                  <div className={styles2.postoptionicontext}>Replace</div>
                </div>
              </div>
            </div>
          </div>

          <div className="headerandinput">
            <div className="headerparent">
              <div className="headertext">Type</div>

              <div className={styles2.typeparent}>
                <div
                  onClick={() => {
                    setPostType(PostType.Single);
                    setShowMediaIndex(0);
                    setShowMedias(showMedias.length > 0 ? [showMedias[0]] : []);
                    setRefresh(!refresh);
                  }}
                  className={postType === PostType.Single ? styles2.selectedType : styles2.type}>
                  Post
                </div>
                <div
                  onClick={() => {
                    setPostType(PostType.Album);
                    setShowMedias(showMedias.length > 0 ? [showMedias[0]] : []);
                  }}
                  className={postType === PostType.Album ? styles2.selectedType : styles2.type}>
                  Album
                </div>
              </div>
            </div>
            {postType === PostType.Album && (
              <div className={styles2.Section}>
                <div className={styles2.postpreview}>
                  <>
                    {showMedias.map((v, i) => (
                      <img
                        loading="lazy"
                        decoding="async"
                        onClick={() => {
                          handleChangeAlbumChildren(i);
                        }}
                        key={i}
                        className={styles2.postpicture}
                        alt=" post picture"
                        src={v.cover.length > 0 ? v.cover : v.media}
                      />
                    ))}
                  </>
                  {showMedias.length <= 9 && (
                    <div onClick={handleUploadImage} className={styles2.addnew}>
                      <input
                        id="add post"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleSelectAlbumMedia}
                        ref={inputRef}
                        style={{ display: "none" }}
                      />
                      <img className={styles2.addnewicon} alt="plus icon" src="/plus.svg" />
                    </div>
                  )}
                  {divArray}
                </div>
              </div>
            )}

            {postType === PostType.Single && (
              <>
                <div className={styles2.Section}>
                  <div className={styles2.postpreview}>
                    {showMedias.map((v, i) =>
                      v.mediaType == MediaType.Image || v.coverUri ? (
                        <img
                          loading="lazy"
                          decoding="async"
                          onClick={() => {
                            setShowMediaIndex(i);
                          }}
                          key={i}
                          className={styles2.postpicture}
                          alt="post picture"
                          src={v.mediaType == MediaType.Image ? (v.mediaUri ?? v.media) : (v.coverUri ?? v.cover)}
                        />
                      ) : (
                        <video
                          onClick={() => {
                            setShowMediaIndex(i);
                          }}
                          key={i}
                          className={styles2.postpicture}
                          src={v.mediaUri ?? v.media}
                        />
                      ),
                    )}
                    {showMedias.length === 0 && (
                      <div onClick={handleUploadImage} className={styles2.addnew}>
                        <input
                          id="add post"
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleSelectSingleMedia}
                          ref={inputRef}
                          style={{ display: "none" }}
                        />
                        <img className={styles2.addnewicon} alt="plus" src="/plus.svg" />
                      </div>
                    )}

                    {disableDivArray}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.left}>
          <div className="headerandinput">
            <div className="headertext">Tag and Mention</div>

            <div className="ButtonContainer" style={{ height: "40px" }}>
              <InputText
                className={"serachMenuBar"}
                placeHolder={"Search People"}
                handleInputChange={handleSearchPeopleInputChange}
                value={searchPeaple}
                maxLength={undefined}
                name=""
              />
              {searchPeaple.length > 0 && showAddPeapleBox && (
                <div className={styles2.resultSearchmention}>
                  {pageInfo?.map((v) => (
                    <div onClick={() => handleSelectPage(v)} key={v.pk} className={styles2.searchContent}>
                      <img
                        loading="lazy"
                        decoding="async"
                        className={styles2.userProfile}
                        src={basePictureUrl + v.profilePicUrl}
                      />
                      <div className={styles2.username}>{v.userName}</div>
                    </div>
                  ))}
                </div>
              )}
              <div
                onClick={handleTagPeaple}
                className={showMedias.length > 0 && selectedPeaple ? "cancelButton" : "disableCancelButton"}
                style={{
                  width: "40%",
                  height: "40px",
                  color: "var(--color-dark-blue)",
                  border: "1px solid var(--color-dark-blue)",
                  fontSize: "var(--font-14)",
                  fontWeight: "var(--weight-600)",
                }}>
                Add People
              </div>
            </div>
            <div className="explain">
              *Ater tag people <strong>Adjust Tag</strong> or <strong>Double Click</strong> to remove
            </div>
          </div>
          <div className="headerandinput">
            <div className="headerparent">
              <div className="headertext">Caption</div>
              <div className={styles2.titleCard}>
                <div className="counter">
                  <div className={styles2.icon}>T</div>(<strong>{captionTextArea.length}</strong> /<strong>2200</strong>
                  )
                </div>
                <div className="counter">
                  <img className={styles2.icon} alt="hashtags" src="/icon-hashtag.svg"></img>(
                  <strong>{hashtagsWord.length}</strong> /<strong>30</strong>)
                </div>
              </div>
            </div>
            <TextArea
              style={{ height: "300px" }}
              className={"captiontextarea"}
              placeHolder={""}
              fadeTextArea={false}
              handleInputChange={handleChangeCaptionTextarea}
              handleKeyDown={handleKeyDownCaptionTextarea}
              value={captionTextArea}
              maxLength={2200}
              name=""
              role={"caption"}
              title={"caption  "}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Content;
