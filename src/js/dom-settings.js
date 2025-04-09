import { LeftSidebar } from "./dom-left-sidebar";

const Settings = (() => {
  const loadUserInfoInSettings = (user) => {
    const photoPreviewImg = document.querySelector(".settings-photo-preview");
    const currentName = document.querySelector(".current-name");
    const currentUsername = document.querySelector(".current-username");
    const base64 = localStorage.getItem("userPhoto");
    if (base64) {
      photoPreviewImg.classList.remove("empty");
      document.documentElement.style.setProperty(
        "--current-uploaded-ph",
        `url(${base64})`
      );
    }

    currentName.textContent = user.fullname;
    currentUsername.textContent = user.username;
  };

  const _CurrentUploadedPhoto = (() => {
    let photoUrl = null;
    let photoFile = null;

    const setUrl = (url) => {
      if (_ValidatePhoto(url)) {
        photoUrl = url;
        return true;
      } else {
        return false;
      }
    };

    const getUrl = () => {
      return photoUrl;
    };

    const getUrlCss = () => {
      return `url(${photoUrl})`;
    };

    const setCssVarUrl = (cssUrl) => {
      document.documentElement.style.setProperty(
        "--current-uploaded-ph",
        cssUrl
      );
    };

    const resetCssVarUrl = () => {
      document.documentElement.style.setProperty(
        "--current-uploaded-ph",
        "var(--empty-photo-url)"
      );
    };

    const setFile = (file) => {
      if (!file || !file.type.startsWith("image/")) {
        console.error("Invalid image file");
        return false;
      }
      photoFile = file;
    };

    const getFile = () => {
      return photoFile;
    };

    const reset = () => {
      photoUrl = null;
      photoFile = null;
    };

    return {
      setUrl,
      getUrl,
      getUrlCss,
      reset,
      setCssVarUrl,
      resetCssVarUrl,
      setFile,
      getFile,
    };
  })();

  const _updateUserInfoFromSettings = (user, formData) => {
    const photoFile = _CurrentUploadedPhoto.getFile();
    const newName = formData.get("new-name");
    const newUsername = formData.get("new-username");

    let willWaitForPhoto = false;

    if (photoFile && photoFile.type.startsWith("image/")) {
      willWaitForPhoto = true;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        localStorage.setItem("userPhoto", base64String);
        LeftSidebar.updateUserPreviewInfo(user); // update info when photo is loaded
      };
      reader.readAsDataURL(photoFile);
    }

    if (newName && user.validateNameOrUsername(newName)) {
      user.fullname = newName;
    }
    if (newUsername && user.validateNameOrUsername(newUsername)) {
      user.username = newUsername;
    }

    if (!willWaitForPhoto) {
      // update immediately if no photo change
      LeftSidebar.updateUserPreviewInfo(user);
    }
  };

  const clickOnExitSettings = (user, saveChanges = false) => {
    const settingsDialog = document.querySelector("#settings-dialog");
    const settingsForm = document.querySelector("#settings");
    if (saveChanges) {
      const formData = new FormData(settingsForm);
      _updateUserInfoFromSettings(user, formData);
    }
    settingsDialog.close();
    settingsForm.reset();
  };

  const _ValidatePhoto = (url) => {
    if (typeof url === "string" && url.startsWith("blob:")) {
      return true;
    }

    const isUrlObject = (url) => {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    };

    const isAnImage = (urlObj) => {
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".bmp",
      ];
      const pathname = urlObj.pathname.toLowerCase();
      return imageExtensions.some((ext) => pathname.endsWith(ext));
    };

    if (!isUrlObject(url)) {
      return false;
    }

    const urlObj = new URL(url);
    console.log(urlObj);

    return isAnImage(urlObj) ? true : false;
  };

  const _showTemporarilyPhotoPreview = () => {
    const settingsDialog = document.querySelector("#settings-dialog");
    _CurrentUploadedPhoto.setCssVarUrl(_CurrentUploadedPhoto.getUrlCss());
    settingsDialog.addEventListener(
      "close",
      () => {
        _CurrentUploadedPhoto.reset();
        _CurrentUploadedPhoto.resetCssVarUrl();
      },
      { once: true }
    );
  };

  const _settingsWarning = (element=null, msg) => {
    const parent = document.querySelector('#settings');

    if (!element || !element.classList.contains('settings-child')){
      console.error('Error: only #settings childs are valid');
      return;
    }
    const existingWarning = parent.querySelector('.settings-warning');
    if (existingWarning){
      existingWarning.remove();
    }

    const warningDiv = document.createElement('div');
    warningDiv.classList.add('settings-warning')
    const warningP = document.createElement('p');
    warningP.textContent = String(msg);
    warningDiv.appendChild(warningP);
    element.after(warningDiv);

    const controller = new AbortController();

    const removeWarning = (warningDiv) => {
      warningDiv.remove();
      controller.abort();
      return;
    }

    const inputChild = element.querySelector('input');

    if (inputChild.id === 'photo-input'){
      inputChild.addEventListener('click', () => removeWarning(warningDiv), { 
        signal: controller.signal, 
      });
    } else {
      inputChild.addEventListener('blur', () => removeWarning(warningDiv), { 
        signal: controller.signal, 
      });
      inputChild.addEventListener('keydown', () => removeWarning(warningDiv), { 
        signal: controller.signal, 
      });
    }

    parent.closest('#settings-dialog').addEventListener('close', () => removeWarning(warningDiv), { 
      signal: controller.signal, 
    });

  }

  const clickOnUploadPhoto = (user) => {
    const uploadPhotoDiv = document.querySelector(".settings-photo-preview");
    const input = document.querySelector("#photo-input");

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      if (!file.type.startsWith("image/")){
        _settingsWarning(uploadPhotoDiv.closest('.settings-child'), 'Please upload an image file');
        return;
      }
      const photoUrl = URL.createObjectURL(file);
      if (_CurrentUploadedPhoto.setUrl(photoUrl) === false) {
        URL.revokeObjectURL(photoUrl);
        return;
      }
      _CurrentUploadedPhoto.setFile(file);
      _CurrentUploadedPhoto.setCssVarUrl(_CurrentUploadedPhoto.getUrlCss());
      _showTemporarilyPhotoPreview();
      uploadPhotoDiv.classList.remove("empty");
    };
    input.click();
  };

  return {
    clickOnExitSettings,
    clickOnUploadPhoto,
    loadUserInfoInSettings,
  };
})();

export { Settings };
