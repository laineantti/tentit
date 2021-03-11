
import { useState, useEffect } from 'react'
import User from './User'
import Admin from './Admin'
import Stats from './Stats'
import Upload from './Upload'
import Register from './Register'
import Login from './Login'
import { NavBar } from './NavBar'
import { NavBarLogin } from './NavBarLogin'
import { Route, Switch/* , Redirect */ } from 'react-router-dom'
import { autentikoitu } from './helpers'

export const Routes = () => {
    const [kirjautunut, setKirjautunut] = useState(false)
    const [currentUser, setCurrentUser] = useState("")
    const [currentUserName, setCurrentUserName] = useState("")
    const [currentExamIndex,setCurrentExamIndex] = useState(-1)
    const [currentExamId, setCurrentExamId] = useState(-1)
    const [examEdit,setExamEdit] = useState(false)


    // autentikoidun paluuarvo on joko token tai false
    useEffect(() => {
        let paluuarvo = autentikoitu()

        if (paluuarvo) {
            setKirjautunut(true)
        }
    },[])
     
    // tarkistetaanko kirjautumisen tila tokenista ja asetetaan tähän arvoksi?
    

    return (
        <div>
            {kirjautunut ?
                <>
                <NavBar kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}
                currentUser={currentUser} setCurrentUser={setCurrentUser} 
                currentUserName={currentUserName} setCurrentUserName={setCurrentUserName}
                currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex} 
                examEdit={examEdit} setExamEdit={setExamEdit}/>
                <Switch>
                    {/* <Route exact path="/login">
                        <User />
                    </Route>
                    <Route exact path="/user">
                        <User />
                    </Route>
                    <Route exact path="/">
                        <User />
                    </Route> */}
                    <Route exact path="/admin">
                        <Admin kirjautunut={kirjautunut} setKirjautunut={setKirjautunut} 
                        currentUser={currentUser} setCurrentUser={setCurrentUser} 
                        currentUserName={currentUserName} setCurrentUserName={setCurrentUserName}
                        currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                        currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex} 
                        />
                    </Route>
                    <Route exact path="/stats">
                        <Stats />
                    </Route>
                    <Route exact path="/upload">
                        <Upload />
                    </Route>
                    <Route exact path="*">
                        <User kirjautunut={kirjautunut} setKirjautunut={setKirjautunut} 
                        currentUser={currentUser} setCurrentUser={setCurrentUser} 
                        currentUserName={currentUserName} setCurrentUserName={setCurrentUserName}
                        currentExamId={currentExamId} setCurrentExamId={setCurrentExamId}
                        currentExamIndex={currentExamIndex} setCurrentExamIndex={setCurrentExamIndex} 
                        />
                    </Route>
                </Switch>
                </>
                :
                <>
                <Switch>
                    <Route exact path="/register">
                        <Register />
                    </Route>
                    <Route exact path="*">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route>
                    {/* <Route exact path="/login">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route>
                    <Route exact path="/">
                        <Login kirjautunut={kirjautunut} setKirjautunut={setKirjautunut}/>
                    </Route> */}
                </Switch>
                </>
            }
        </div>
    )
}