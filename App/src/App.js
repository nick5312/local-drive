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

const App = () => {
  const classes = useStyles()
  const [currentMountPointId, setCurrentMountPointId] = useState(-1)

  const onMountPointSelect = (id) => {
    setCurrentMountPointId(id)
  }

  const onReturn = () => {
    setCurrentMountPointId(-1)
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {
          currentMountPointId === -1 
            ? <MountPointSelection onMountPointSelect={onMountPointSelect}/> 
            : <FileBrowser mountPointId={currentMountPointId} onReturn={onReturn}/>
        }
      </div>
    </div>
    )
}

export default App;
