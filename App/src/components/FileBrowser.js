import { 
  Breadcrumbs,
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Link,
  Typography,
  Modal,
  Paper,
  makeStyles,
  Grid,
  Button,
  IconButton,
  Checkbox
} from "@material-ui/core"

import { 
  Image, 
  Movie, 
  LibraryMusic, 
  Folder, 
  TextFields,
  InsertDriveFile,
  Delete,

} from "@material-ui/icons"

import { useState, useEffect, forwardRef } from "react"

const useStyles = makeStyles({
  textModal: {
    width: "60%",
    height: "80%",
    position: "absolute",
    padding: "15px",
    overflow: "auto",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    whiteSpace: "pre-wrap"
  },
  imageModal: {
    left: "50%",
    top: "50%",
    maxHeight: "80%",
    transform: "translate(-50%, -50%)",
    position: "absolute",
  },
  audioModal: {
    left: "50%",
    top: "50%",
    width: "40%",
    transform: "translate(-50%, -50%)",
    position: "absolute"
  },
  container: {
    height: "100%",
  },
  navItem: {
    maxWidth: "200px"
  },
  header: {
    backgroundColor: "#f5f5f5",
    height: "55px",
    display: "flex",
    alignItems: "center"
  },
  fileBrowser: {
    height: "calc(100% - 55px - 65px)",
    overflow: "auto"
  },
  navBar: {
    height: "50px",
    display: "flex",
    alignItems: "center"
  }
})

const getMountPointFiles = async (id) => {
  const res = await fetch(`/location/${id}`)
  const data = await res.json()
  return data["data"]
}

const FileBrowserIcon = (props) => {
  switch (props.fileType) {
    case "TEXT": return <TextFields />
    case "AUDIO": return <LibraryMusic />
    case "IMAGE": return <Image />
    case "VIDEO": return <Movie />
    case "FOLDER": return <Folder />
    default: return <InsertDriveFile />
  }
}

const TextModal = (props) => {
  const classes = useStyles()
  const [text, setText] = useState("")

  useEffect(() => {
    fetch(`/location/${props.mountPointId}/file?path=${encodeURIComponent(props.file["path"])}`)
      .then(res => res.text())
      .then(text => setText(text))
  }, [props.file, props.mountPointId])

  return (
      <Paper className={classes.textModal}>
        <Typography variant="h5">{props.file["name"]}</Typography>
        <Typography>{text}</Typography>
      </Paper>
  )
}

const ImageModal = (props) => {
  const classes = useStyles()

  return (
      <img 
        className={classes.imageModal} 
        src={`http://localhost:5000/location/${props.mountPointId}/file?path=${encodeURIComponent(props.file["path"])}`}
      />
  )
}

const VideoModal = (props) => {
  const classes = useStyles()

  return (
    <video
      autoPlay
      className={classes.imageModal}
      controls
      src={`http://localhost:5000/location/${props.mountPointId}/file?path=${encodeURIComponent(props.file["path"])}`}/>
  )
}

const AudioModal = (props) => {
  const classes = useStyles()

  return (
    <audio
      className={classes.audioModal}
      controls
      autoPlay
      src={`http://localhost:5000/location/${props.mountPointId}/file?path=${encodeURIComponent(props.file["path"])}`}
    />
  )
}

const FileViewer = forwardRef((props, ref) => {
  switch (props.file["type"]) {
    case "TEXT": return <TextModal {...props} />
    case "IMAGE": return <ImageModal {...props} />
    case "VIDEO": return <VideoModal {...props} />
    case "AUDIO": return <AudioModal {...props} />
    default: return <div></div>
  }
})

const FileBrowser = (props) => {
  const classes = useStyles()
  const [currentFolder, setCurrentFolder] = useState({})
  const [folderStack, setFolderStack] = useState([])
  const [openFile, setOpenFile] = useState({})
  const [interactState, setInteractState] = useState(false)
  const [selectedIndices, setSelectedIndices] = useState([])

  useEffect(() => {
    getMountPointFiles(props.mountPointId)
      .then(folder => {
        setCurrentFolder(folder)
        setFolderStack([folder])
      })
  }, [props.mountPointId])

  const refreshCurrentPath = () => {
    getMountPointFiles(props.mountPointId)
      .then(folder => {
        if ("children" in folder) {
          let newFolderStack = [folder]
          let newCurrentFolder = folder
          for (var index = 1; index < folderStack.length; index++) {
            const oldFolder = folderStack[index]
            const sameFolderIndex = newCurrentFolder["children"].findIndex(file => file["name"] === oldFolder["name"])
            newFolderStack.push(newCurrentFolder["children"][sameFolderIndex])
            newCurrentFolder = newCurrentFolder["children"][sameFolderIndex]
          }

          setFolderStack(newFolderStack)
          setCurrentFolder(newCurrentFolder)
        }
      })
  }

  const onFileClick = (file) => {
    if (file["type"] === "FOLDER") {
      setCurrentFolder(file)
      setFolderStack([...folderStack, file])
    } else {
      setOpenFile(file)
    }
  }

  const onFileDelete = () => {
    console.log(selectedIndices)
    let promises = []
    for (const index of selectedIndices) {
      const file = currentFolder["children"][index]
      promises.push(fetch(`/location/${props.mountPointId}/file?path=${encodeURIComponent(file["path"])}`, {
        method: "DELETE"
      }))
    }

    Promise.all(promises)
      .then(_ => {
        let currentFolderCopy = {}
        Object.assign(currentFolderCopy, currentFolder)
        currentFolderCopy["children"] = currentFolderCopy["children"]
          .filter((_, index) => !selectedIndices.includes(index))
        setCurrentFolder(currentFolderCopy)

        let folderStackCopy = [...folderStack]
        folderStackCopy.splice(folderStack.length - 1, 1, currentFolderCopy)
        setFolderStack(folderStackCopy)

        setSelectedIndices([])
        setInteractState(false)
      })
  }

  const onFileUpload = (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0])
    formData.append("name", "upload")
    console.log(currentFolder)

    fetch(`/location/${props.mountPointId}/file?path=${currentFolder["path"]}`, {
      method: "POST",
      body: formData
    }).then(_ => refreshCurrentPath())
  } 

  const onNavClick = (index) => {
    if (index !== folderStack.length - 1) {
      const clickedFolder = folderStack[index]
      setFolderStack(folderStack.slice(0, index + 1))
      setCurrentFolder(clickedFolder)
    }
  }

  const onItemSelect = (number) => {
    if (selectedIndices.includes(number)) {
      const copy = [...selectedIndices]
      const index = copy.indexOf(number)
      copy.splice(index, 1)
      setSelectedIndices(copy)
    } else {
      setSelectedIndices([...selectedIndices, number])
    }
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Grid container spacing={0}>
          <Grid item xs={1}>
            <Button component="label">
              Upload
              <input onChange={onFileUpload} type="file" hidden/>        
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Button onClick={onFileDelete}>Delete</Button>
          </Grid>
          <Grid item xs={1}>
            <Button onClick={() => setInteractState(!interactState)}>Modify</Button>
          </Grid>
        </Grid>
      </div>
      <div className={classes.navBar}>
        <Breadcrumbs>
            <Typography noWrap>
              <Link
                color="inherit"
                onClick={props.onReturn}
                >
                  Selection
              </Link>
            </Typography>
          {
            folderStack.map((item, index) =>
            <div key={index} className={classes.navItem}>
              <Typography noWrap>
                <Link
                  color="inherit"
                  onClick={() => onNavClick(index)}>
                    {item["name"]}
                </Link>
              </Typography>
            </div>)
          }
          </Breadcrumbs>
      </div>
      <div className={classes.fileBrowser}>
        {
          Object.keys(currentFolder).length && currentFolder["children"].map((item, index) =>
            <Grid container key={index} spacing>
              {
                interactState &&
                  <Grid container align="center" justify="center" item xs={1}>
                    <Checkbox onChange={() => onItemSelect(index)} checked={selectedIndices.includes(index)}/>
                  </Grid>
              }
              <Grid item xs={interactState ? 11 : 12}>
                <ListItem button onClick={() => onFileClick(item)}>
                  <ListItemIcon>
                    <FileBrowserIcon fileType={item["type"]}/>
                  </ListItemIcon>
                  <ListItemText primary={item["name"]}/>
                </ListItem>
              </Grid>
            </Grid>
          )
        }
      </div>
      <Modal
        open={Object.keys(openFile).length !== 0} 
        onClose={() => setOpenFile({})}>
        <FileViewer mountPointId={props.mountPointId} file={openFile} />
      </Modal>
    </div>
  )
}

export default FileBrowser
