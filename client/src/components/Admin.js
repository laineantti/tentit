import { React, useState, useEffect, useReducer } from 'react'
import uuid from 'react-uuid'
import { useStyles, /* GreenCheckbox, */ ExamButton } from './Style'
import axios from 'axios'
import {
    Card, CardContent, CardMedia, Container, Button,
    List, ListItem, Box, /* Checkbox, */ Icon, IconButton, 
    CssBaseline, Dialog, DialogTitle, DialogContent,
    TextField
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import DialogActions from '@material-ui/core/DialogActions'

var path = null
var default_error = new Error("Environment not properly set!")
let environment = process.env.NODE_ENV || 'development'

switch (environment) {
    case 'production':
        path = 'https://tentti-fullstack.herokuapp.com/'
        break
    case 'development':
        path = 'http://localhost:4000/'
        break
    case 'test':
        path = 'http://localhost:4000/'
        break
    default:
        throw default_error
}

function reducer(state, action) {

    let tempCopy = JSON.parse(JSON.stringify(state))

    switch (action.type) {

        case "add_choise":
            let newChoise = { choise: "", checked: false, correctAnswer: false }
            tempCopy[action.data.examIndex].cards[action.data.cardIndex].choises
                .push(newChoise)
            return tempCopy

        case "add_card":
            let newCard = {
                label: "", choises: [{ choise: "", checked: false, correctAnswer: false }]
            }
            tempCopy[action.data.examIndex].cards[action.data.cardIndex].cards
                .push(newCard)
            return tempCopy

        case "card_label_changed":
            tempCopy[action.data.examIndex].cards[action.data.cardIndex].label =
                action.data.newCardLabel
            return tempCopy

        case "card_deleted":
            tempCopy[action.data.examIndex].cards[action.data.cardIndex].cards
                .splice(action.data.cardIndex, 1)
            return tempCopy

        case "add_exam":
            let newExam = [
                {
                    uuid: uuid(),
                    name: action.data.examName,
                    cards: [
                        {
                            label: "",
                            choises: [
                                { choise: "", checked: false, correctAnswer: false }
                            ]
                        }
                    ]
                }
            ]
            action.data.handle_close()
            tempCopy.push(newExam)
            return tempCopy

        case "checked_changed":
            tempCopy[action.data.examIndex].kysymykset[action.data.cardIndex]
                .vaihtoehdot[action.data.listItemIndex].vastaus = action.data.checkedValue
            return tempCopy

        case "choise_changed":
            tempCopy[action.data.examIndex].cards[action.data.cardIndex]
                .choises[action.data.listItemIndex].choise = action.data.newChoise
            return tempCopy

        case "choise_deleted":
            tempCopy[action.data.examIndex].cards[action.data.cardIndex]
                .choises.splice(action.data.listItemIndex, 1)
            return tempCopy

        case "answer_changed":
            tempCopy[action.data.examIndex].cards[action.data.cardIndex]
                .choises[action.data.listItemIndex].correctAnswer
                = action.data.checkedValue
            return tempCopy

        case "INIT_DATA":
            return action.data

        default:
            throw new Error()

    }
}

function App() {
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
    const [currentExamIndex, setCurrentExamIndex] = useState(-1)
    const [state, dispatch] = useReducer(reducer, [])
    const [examName, setExamName] = useState("")
    const [open, setOpen] = useState(false)
    const classes = useStyles()
    /* const currentKurssiIndex = 1 */
    const currentUserIndex = 1

    useEffect(() => {

        /* const createData = async () => {
            try {
                await axios.post(path+"tentit", initialData)
                dispatch({ type: "INIT_DATA", data: initialData })
                setdataInitialized(true)
            } catch (exception) {
                console.log("Tietokannan alustaminen epäonnistui.")
            }
        } */

        const fetchData = async () => {
            try {
                let tentit_data = await axios.get(path+"kayttajan_tentit/" + currentUserIndex)
                let tentit = tentit_data.data
                /* console.log("Käyttäjä " + currentUserIndex + " kirjautuneena.") */

                if (tentit.length > 0) {
                    // käydään tentit läpi
                    for (var i = 0; i < tentit.length; i++) {
                        // haetaan tentin kysymykset
                        tentit[i].kysymykset = []
                        let kysymykset_taulu = await axios.get(path+"tentin_kysymykset/" + tentit[i].id)
                        tentit[i].kysymykset = kysymykset_taulu.data
                        // haetaan kayttajan_vastaukset
                        let kayttajan_vastaukset =
                            await axios.get(path+"kayttajan_vastaukset/"
                                + currentUserIndex + "/" + tentit[i].id)
                        // käydään tentin kysymykset läpi
                        for (var j = 0; j < tentit[i].kysymykset.length; j++) {
                            // haetaan kysymyksen vaihtoehdot
                            tentit[i].kysymykset[j].vaihtoehdot = []
                            let vaihtoehdot_taulu =
                                await axios.get(path+"kysymyksen_vaihtoehdot/" + tentit[i].kysymykset[j].id)
                            tentit[i].kysymykset[j].vaihtoehdot = vaihtoehdot_taulu.data
                            // käydään kayttajan_vastaukset läpi
                            for (var k = 0; k < tentit[i].kysymykset[j].vaihtoehdot.length; k++) {
                                for (var l = 0; l < kayttajan_vastaukset.data.length; l++) {
                                    if (tentit[i].kysymykset[j].vaihtoehdot[k].id === kayttajan_vastaukset.data[l].vaihtoehto_id) {
                                        tentit[i].kysymykset[j].vaihtoehdot[k]
                                            .vastaus = kayttajan_vastaukset.data[l].vastaus
                                    }
                                }
                            }
                        }
                    }
                    dispatch({ type: "INIT_DATA", data: tentit })
                    /* console.log(tentit) */
                } else {
                    throw console.log("Dataa ei saatu palvelimelta.")
                }
            }
            catch (exception) {
                console.log(exception)
            }
        }
        fetchData()
    }, [])

   /*  useEffect(() => {

        const updateData = async () => {
            try {
                await axios.put(path+"tentit", state)
            } catch (exception) {
                console.log("Datan päivitäminen ei onnistunut.")
            }
            finally {

            }
        }

        if (dataInitialized) {
            updateData()
        }
    }, [state, dataInitialized]) */

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    /* const valintaMuuttui = async (kysymys_id, checkedValue, vaihtoehto_id, listItemIndex, exam_id) => {
        try {
            // /paivita_valinta/:kayttaja_id/:vaihtoehto_id/:tentti_id/:kurssi_id/:vastaus
            console.log(vaihtoehto_id)
            await axios.put(path+"paivita_valinta/"
                + currentUserIndex + "/"
                + vaihtoehto_id + "/"
                + exam_id + "/"
                + currentKurssiIndex + "/"
                + checkedValue)
        } catch (exception) {
            console.log("Datan päivitäminen ei onnistunut.")
        }
        dispatch({
            type: "checked_changed",
            data: {
                examIndex: currentExamIndex,
                cardIndex: kysymys_id,
                listItemIndex: listItemIndex,
                checkedValue: checkedValue
            }
        })
    } */

    const currentExamIndexChanged = (value) => {
        /* console.log(value) */
        setCurrentExamIndex(value)
        setShowCorrectAnswers(false)
    }

    const allCorrect = (cardChoisesArray) => {
        /* console.log(cardChoisesArray.filter(choise => choise.vastaus
            === choise.oikea_vastaus).length, cardChoisesArray.length) */
        return (cardChoisesArray.filter(choise => choise.vastaus
            === choise.oikea_vastaus).length === cardChoisesArray.length)
    }

    return (
        <Box>
            <CssBaseline />
            <Container key="container1_admin" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                {Object.values(state).map((exam, examIndex) =>
                    <ExamButton style={{ marginTop: "10px" }} key={uuid()} name={exam.nimi} onClick={() => currentExamIndexChanged(examIndex)}>
                        {/* {exam.nimi + "(exam.id=" + exam.id + ", examIndex=" + examIndex + ")"} */}
                        {exam.nimi}
                    </ExamButton>
                )}
                <IconButton onClick={handleClickOpen}>
                    <Icon>add_circle</Icon>
                </IconButton>
                <Dialog open={open} onClose={handleClose}
                    aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Lisää uusi tentti</DialogTitle>
                    <DialogContent>
                        {/* TextField, defaultValue, onBlur = toimii */}
                        <TextField
                            autoFocus
                            margin="dense"
                            id="examName"
                            label="Tentin nimi"
                            type="exam"
                            fullWidth
                            value={examName}
                            onChange={(event) => setExamName(event.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Peruuta
                      </Button>
                        <Button style={{ marginTop: "10px" }} onClick={() => dispatch(
                            {
                                type: "add_exam", data: {
                                    examName: examName,
                                    handle_close: handleClose
                                }
                            }
                        )} color="primary">
                            Lisää tentti
                      </Button>
                    </DialogActions>
                </Dialog>
                {currentExamIndex >= 0 &&
                    (
                        <>
                            <h2>{state[currentExamIndex].nimi + " (exam.id = " + state[currentExamIndex].id + ")"}</h2>
                            {Object.values(state[currentExamIndex].kysymykset)
                                .map((card, cardIndex) =>
                                    <Card style={{ marginTop: "10px" }} key={uuid()} className={classes.root}>
                                        <CardContent style={{ width: "100%" }} className={classes.content}>
                                            <List>
                                                {/* <p className="label" style={{ whiteSpace: "pre-wrap" }}>
                                                    {card.lause + " (exam.id = " + state[currentExamIndex].id + ")"}
                                                </p> */}
                                                <TextField key={uuid()} style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}
                                                    onChange={(event) => dispatch({
                                                        type: "card_label_changed",
                                                        data: {
                                                            newCardLabel: event.target.value,
                                                            examIndex: currentExamIndex,
                                                            cardIndex: cardIndex
                                                        }
                                                    })}
                                                    value={card.label} />
                                                <IconButton key={uuid()} style={{ float: "right" }} label="delete"
                                                    color="primary" onClick={() => dispatch(
                                                        {
                                                            type: "card_deleted", data: {
                                                                examIndex: currentExamIndex,
                                                                cardIndex: cardIndex
                                                            }
                                                        }
                                                    )}>
                                                    <DeleteIcon />
                                                </IconButton >
                                                {Object.values(card.vaihtoehdot).map((listItem, listItemIndex) => (
                                                    <ListItem key={uuid()}> {/* (listItem.vastaus === undefined)?false: */}
                                                        <TextField key={uuid()} style={{
                                                            minWidth: "600px", overflow: "hidden",
                                                            textOverflow: "ellipsis"
                                                        }} value={listItem.choise}
                                                            onChange={(event) => dispatch(
                                                                {
                                                                    type: "choise_changed", data: {
                                                                        examIndex: currentExamIndex,
                                                                        cardIndex: cardIndex,
                                                                        listItemIndex: listItemIndex,
                                                                        newChoise: event.target.value
                                                                    }
                                                                }
                                                            )} />
                                                        <IconButton style={{ float: "right" }} label="delete" color="primary"
                                                            onClick={() => dispatch(
                                                                {
                                                                    type: "choise_deleted", data: {
                                                                        examIndex: currentExamIndex,
                                                                        cardIndex: cardIndex,
                                                                        listItemIndex: listItemIndex
                                                                    }
                                                                }
                                                            )}>
                                                            <DeleteIcon /></IconButton >
                                                        {/* {console.log(listItem)} */}
                                                        {/* <Checkbox checked={listItem.vastaus} disabled={showCorrectAnswers}
                                                            onChange={(event) => {
                                                                valintaMuuttui(cardIndex, event.target.checked, listItem.id, listItemIndex, state[currentExamIndex].id)
                                                            }}
                                                        />
                                                        {showCorrectAnswers && <GreenCheckbox disabled checked={listItem.oikea_vastaus} color="primary" />}
                                                        <p style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {listItem.vaihtoehto}
                                                        </p> */}
                                                    </ListItem>
                                                ))}
                                                <IconButton onClick={() => dispatch({
                                                    type: "add_choise",
                                                    data: { cardIndex: cardIndex }
                                                })}>
                                                    <Icon>add_circle</Icon>
                                                </IconButton>
                                            </List>
                                        </CardContent>
                                        {(showCorrectAnswers && (allCorrect(Object.values(card.vaihtoehdot))) ? (
                                            <CardMedia className={classes.cover}>
                                                <img className="image" src="/images/selma.png"
                                                    height="30px" width="30px" alt="Selma" />
                                            </CardMedia>
                                        ) : (null))}
                                    </Card>
                                )
                            }
                            < IconButton style={{ float: "right" }}
                                onClick={() => dispatch({ type: "add_card" })}>
                                <Icon>add_circle</Icon>
                            </IconButton>
                            <Button style={{ marginTop: "10px", marginRight: "10px" }} name="vastaukset" variant="contained" color="primary"
                                onClick={() => (
                                    (showCorrectAnswers ? setShowCorrectAnswers(false) : setShowCorrectAnswers(true))
                                )}>Näytä vastaukset</Button>
                        </>
                    )
                }
            </Container>
        </Box>
    )
}

export default App