import {
  Grid,
  Button,
  TextField,
  ListItem,
  ListItemText,
  IconButton
} from "@material-ui/core"

import { Delete } from "@material-ui/icons"
import { Alert } from "@material-ui/lab";
import { useEffect, useState } from "react";

const getAvailableMountPoints = async () => {
  const res = await fetch("/location")
  const data = await res.json()
  return data["data"]
}

const MountPointSelection = (props) => {
  const [pathList, setPathList] = useState([])
  const [additionalPath, setAdditionalPath] = useState("")
  const [deleteState, setDeleteState] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    getAvailableMountPoints()
      .then(paths => setPathList(paths))
  }, [])

  const onAddTextFieldChange = (e) => {
    setAdditionalPath(e.target.value)
  }

  const onAddButtonClick = () => {
    // TODO: Perform propper slash sanitization
    fetch(`/location?path=${encodeURIComponent(additionalPath)}`, {
      method: "POST"
    }).then(async res => {
      if (res.ok) {
        setAdditionalPath("")
        setPathList(await getAvailableMountPoints())
      } else {
        setErrorMsg(await res.text())
      }
    })
  }

  const onPathDelete = (id) => {
    fetch(`/location/${id}`, {
      method: "DELETE"
    }).then(async res => {
      if (res.ok) {
        setPathList(await getAvailableMountPoints())
      } else {
        setErrorMsg("Failed to delete mount point")
      }
    })
  }

  const onPathClick = (id) => {
    if (props.onMountPointSelect) {
      props.onMountPointSelect(id)
    }
  }

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={9}>
          <TextField 
            onChange={onAddTextFieldChange} 
            value={additionalPath}
            error={errorMsg !== ""}
            fullWidth
            size="small" 
            label="Path" 
            variant="outlined"
          />
        </Grid>
        <Grid container item xs={3}>
          <Grid container align="center" justify="center" item xs={6}>
            <Button onClick={onAddButtonClick}>Add</Button>
          </Grid>
          <Grid container align="center" justify="center" item xs={6}>
            <Button onClick={() => setDeleteState(!deleteState)}>Delete</Button>
          </Grid>
        </Grid>
        {
          errorMsg && 
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setErrorMsg("")}>{errorMsg}</Alert>
            </Grid>
        }
      </Grid>
      {
        pathList && pathList.map(item => 
          <Grid container key={item["id"]} spacing={1}>
            {
              deleteState && <Grid container align="center" justify="center" item xs={1}>
                <IconButton onClick={() => onPathDelete(item["id"])}>
                  <Delete />
                </IconButton>
              </Grid>
            }
            <Grid item xs={deleteState ? 11 : 12}>
              <ListItem button onClick={() => onPathClick(item["id"])}>
                <ListItemText primary={item["path"]}/>
              </ListItem>
            </Grid>
          </Grid>
        )
      }
    </div>
  );
}

export default MountPointSelection
