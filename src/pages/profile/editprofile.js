import React, { useState } from "react";
import {TERipple, TEInput } from "tw-elements-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProfileContext } from "../../hooks/useProfileContext";
import { useNavigate } from "react-router-dom"
import primarybg from "../../assets/images/primarybg.png";

const formStyle = {
    borderRadius: 15,
    background: 'linear-gradient(to right, #4a236f, #4a236f)', 
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.2)',
    backdropFilter: 'blur(5px)',
    transition: 'background 0.5s ease-in-out',
    '&:hover': {
      background: 'linear-gradient(to right, #4a236f, #7B68EE)', 
    },
    width: 500,
    color: 'white',
    borderColor: '#5e5e5e',
    borderWidth: 2,
    padding: 8
  };
const inputStyle = {
  backgroundColor: '#4a236f',
  fontColor: '#e5e5e5',
  borderRadius: 3,
  borderColor: '#5e5e5e',
  marginTop: '1vh',
  marginBottom: '2vh'
}

const EditProfile = () => {

    const { user } = useAuthContext();
    const { dispatch } = useProfileContext();
    const navigate = useNavigate();

    const [image, setImage] = useState('');
    const [contact, setContact] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [error, setError] = useState(null);
    const user_id = user.user_id;
    const formData = new FormData();

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!user){
          setError('You must be logged in!')
          return
        }
        formData.append('image', image);
        formData.append('contact', contact);
        formData.append('city', city);
        formData.append('state', state);
        formData.append('country', country);
        formData.append('user_id', user_id);

        // const profile = {image, contact, city, state, country, user_id}

        const response = await fetch('http://localhost:4000/app/profile/edit',{
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        const json = await response.json()

        if (!response.ok){
          setError(json.error)
        }
        if (response.ok) {
          dispatch({type: 'CREATE_PROFILE', payload: json})
          navigate('/profile')
        }
    }

  const handleFileUpload = (e) => {
    setImage(e.target.files[0])
  }


    return(
        <>
            <div className="bg-[#090016] bg-cover bg-center h-full  items-center justify-center lg:justify-center"
                style={{ backgroundImage: `url(${primarybg})`, display: 'flex', flexDirection: 'column', height: '95vh'}}>
                      <h2 className="text-5xl font-large text-white leading-tight" style={{paddingBottom:5, marginTop: '5vh', marginBottom: '5vh', fontWeight:700}}>Edit Profile</h2>
            
            <form className="create" onSubmit={handleSubmit} style={formStyle}>
            
            {/* <!-- Image input --> */}
            <h2 className="text-base font-medium leading-tight">Profile Picture</h2>
              <TEInput
                type="file"
                size="lg"
                style={inputStyle}
                id="image"
                name="image"
                accept=".jpeg, .png, .jpg, .heic"
                onChange={handleFileUpload}
              ></TEInput>
            
             {/* <!-- Name input (fetched from user) --> */}
             <h2 className="text-base font-medium leading-tight">Name</h2>
              <TEInput
                type="text"
                label="Your Name"
                size="lg"
                disabled
                style={inputStyle}
                value={user.name}
              ></TEInput>

                {/* <!-- Contact input --> */}
             <h2 className="text-base font-medium leading-tight">Contact</h2>
              <TEInput
                type="text"
                label="Your Contact"
                size="lg"
                style={inputStyle}
                onChange={(e)=>setContact(e.target.value)}
              ></TEInput>

            {/* <!-- City input --> */}
             <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>City</h2>
              <TEInput
                type="text"
                label="City"
                size="lg"
                style={inputStyle}
                onChange={(e)=>setCity(e.target.value)}
              ></TEInput>

            {/* <!-- State input --> */}
             <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>State</h2>
              <TEInput
                type="text"
                label="State"
                size="lg"
                style={inputStyle}
                onChange={(e)=>setState(e.target.value)}
              ></TEInput>

            {/* <!-- Country input --> */}
             <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>Country</h2>
              <TEInput
                type="text"
                label="Country"
                size="lg"
                style={inputStyle}
                onChange={(e)=>setCountry(e.target.value)}
              ></TEInput>


              {/* <!-- Submit button --> */}

              <TERipple rippleColor="light" className="w-full">
                <button
                  type="submit"
                  className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                >
                  Save
                </button>
              </TERipple>

              {error && <div className='error' style={{marginTop: '2vh'}}>{error}</div>}
            </form>
                </div>
        </>
    )

}
export default EditProfile