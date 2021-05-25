import {
  Grid,
  Button,
  TextField,
  ListItem,
  ListItemText,
  Checkbox,
} from "@material-ui/core"

import { Alert } from "@material-ui/lab";
import { useEffect, useState } from "react";
import doFetch from "../utils/doFetch"

const getAvailableMountPoints = async () => {
  const res = await fetch("/location")
  const data = await res.json()
  return data["data"]
}

const MountPointSelection = (props) => {
  const [mountPoints, setMountPoints] = useState([])
  const [currentNewPath, setCurrentNewPath] = useState("")
  const [modifyState, setModifyState] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [selectedMountPointIndices, setSelectedMountPointIndices] = useState([])

  useEffect(() => {
    getAvailableMountPoints()
      .then(data => setMountPoints(data))
  }, [])

  const onAddTextFieldChange = (e) => {
    setCurrentNewPath(e.target.value)
  }

  const onAddButtonClick = async () => {
    const requestUrl = `/location?path=${encodeURIComponent(currentNewPath)}`
    const res = await doFetch(requestUrl, "POST")

    if (res.ok) {
      setCurrentNewPath("")
      setMountPoints(await getAvailableMountPoints())
      setErrorMsg("")
    } else {
      setErrorMsg(await res.text())
    }
  }

  const onPathDelete = async (id) => {
    for (const index of selectedMountPointIndices) {
      const selectedMountPoint = mountPoints[index]
      const res = await doFetch(`/location/${selectedMountPoint["id"]}`, "DELETE")
      if (!res.ok) {
        setErrorMsg("Failed to delete mount point")
        return
      }
    }

    setMountPoints(await getAvailableMountPoints())
    setSelectedMountPointIndices([])
    setModifyState(false)
  }

  const onPathClick = (id) => {
    if (props.onMountPointSelect) {
      props.onMountPointSelect(id)
    }
  }

  const onMountPointSelect = (index) => {
    if (selectedMountPointIndices.includes(index)) {
      const copy = [...selectedMountPointIndices]
      const removeIndex = copy.indexOf(index)
      copy.splice(removeIndex, 1)
      setSelectedMountPointIndices(copy)
    } else {
      setSelectedMountPointIndices([...selectedMountPointIndices, index])
    }
  }

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={9}>
          <TextField 
            onChange={onAddTextFieldChange} 
            error={errorMsg !== ""}
            value={currentNewPath}
            variant="outlined"
            label="Path" 
            size="small"
            fullWidth
          />
        </Grid>
        <Grid container item xs={3}>
          <Grid container align="center" justify="center" item xs={4}>
            <Button onClick={onAddButtonClick}>Add</Button>
          </Grid>
          <Grid container align="center" justify="center" item xs={4}>
            <Button onClick={onPathDelete}>Delete</Button>
          </Grid>
          <Grid container align="center" justify="center" item xs={4}>
            <Button onClick={() => setModifyState(!modifyState)}>Modify</Button>
          </Grid>
        </Grid>
        {errorMsg &&
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setErrorMsg("")}>{errorMsg}</Alert>
          </Grid>
        }
      </Grid>
      <div style={{ paddingTop: "20px" }}>
        {mountPoints &&
          mountPoints.map((item, index) => 
            <Grid container key={item["id"]} spacing={0}>
              {modifyState &&
                <Grid container align="center" justify="center" item xs={1}>
                  <Grid item xs={12}>
                    <Checkbox onChange={() => onMountPointSelect(index)} checked={selectedMountPointIndices.includes(index)}/>
                  </Grid>
                </Grid>
              }
              <Grid item xs={modifyState ? 11 : 12}>
                <ListItem button onClick={() => onPathClick(item["id"])}>
                  <ListItemText primary={item["path"]}/>
                </ListItem>
              </Grid>
            </Grid>
          )
        }
      </div>
    </div>
  );
}

export default MountPointSelection
