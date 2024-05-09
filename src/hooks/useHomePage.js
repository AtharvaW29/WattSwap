
export const useHomePage = () =>{

    const homePage = async () => {
    const response = await fetch('http://localhost:4000/home',{
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify("")
    })
    const json = await response.json()
    console.log(json)
    }

    return{ homePage }
}