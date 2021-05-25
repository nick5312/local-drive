import { makeStyles } from '@material-ui/core/styles';
import { useState } from 'react';

import FileBrowser from './components/FileBrowser';
import MountPointSelection from "./components/MountPointSelection"

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  container: {
    width: "35%",
    height: "100%",
    paddingTop: "15px",
    boxSizing: "border-box"
  }
})

const MainComponent = (props) => {
  const { state, ...rest } = props

  switch (state) {
    case "MOUNT_SELECT": return <MountPointSelection {...rest}/>
    case "FILE_BROWSER": return <FileBrowser {...rest}/>
    default: return <div>Invalid application state</div>
  }
}

const App = () => {
  const classes = useStyles()
  const [currentMountPointId, setCurrentMountPointId] = useState(0)
  const [currentAppState, setCurrentAppState] = useState("MOUNT_SELECT")

  const onMountPointSelect = (id) => {
    setCurrentMountPointId(id)
    setCurrentAppState("FILE_BROWSER")
  }

  const onReturn = () => {
    setCurrentAppState("MOUNT_SELECT")
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <MainComponent
          state={currentAppState}
          mountPointId={currentMountPointId}
          onMountPointSelect={onMountPointSelect}
          onReturn={onReturn}
        />
      </div>
    </div>
    )
}

export default App;
