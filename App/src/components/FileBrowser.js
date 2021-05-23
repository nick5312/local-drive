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
  Button
} from "@material-ui/core"

import { 
  Image, 
  Movie, 
  LibraryMusic, 
  Folder, 
  TextFields,
  InsertDriveFile 
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
  navItem: {
    maxWidth: "200px"
  },
  header: {
    backgroundColor: "#f5f5f5",
    marginBottom: "15px",
    height: "30%"
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

  useEffect(() => {
    getMountPointFiles(props.mountPointId)
      .then(folder => {
        console.log(folder)
        setCurrentFolder(folder)
        setFolderStack([folder])
      })
  }, [props.mountPointId])

  const onFileClick = (file) => {
    if (file["type"] === "FOLDER") {
      setCurrentFolder(file)
      setFolderStack([...folderStack, file])
    } else {
      setOpenFile(file)
    }
  }

  const onNavClick = (index) => {
    if (index !== folderStack.length - 1) {
      const clickedFolder = folderStack[index]
      setFolderStack(folderStack.slice(0, index + 1))
      setCurrentFolder(clickedFolder)
    }
  }

  return (
    <div style={{height: "100%"}}>
      <div className={classes.header}>
        <Grid container justify="flex-end" spacing={2}>
          <Grid container item xs={9}>
            <Grid item xs={4}>
              <Button>Return</Button> 
            </Grid>
          </Grid>
          <Grid container item xs={3}>
            <Grid item xs={6}>
              <Button>Upload</Button>
            </Grid>
            <Grid item xs={6}>
              <Button>Delete</Button>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Breadcrumbs>
        <Typography noWrap>
          <Link
            color="inherit">
              
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
      <div>
        {
          Object.keys(currentFolder).length && currentFolder["children"].map((item, index) => 
            <ListItem button key={index} onClick={() => onFileClick(item)}>
              <ListItemIcon>
                <FileBrowserIcon fileType={item["type"]}/>
              </ListItemIcon>
              <ListItemText primary={item["name"]}/>
            </ListItem>
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
