import React, { Component } from 'react';
import logo from '../assets/images/dp.jpg';
import '../assets/css/Home.css'; // Import the CSS file for styling

export class Home extends Component {
    constructor(props) {
        super(props);
        this.progressRefs = []; // Array to store multiple progress bar refs
        this.observer = null;
        this.state = {
            progress: [
                { name: 'HTML', percentage: 60 },
                { name: 'CSS', percentage: 80 },
                { name: 'JavaScript', percentage: 40 },
                { name: 'Java', percentage: 50 },
                { name: 'Python', percentage: 50 }
            ] // Array of objects containing skill names and percentages for each progress bar
        };
    }

    componentDidMount() {
        this.observer = new IntersectionObserver(this.handleIntersection, {
            threshold: 1 // Adjust the threshold as needed
        });
        this.progressRefs.forEach(ref => this.observer.observe(ref));
    }

    componentWillUnmount() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    handleIntersection = (entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const progress = [...this.state.progress];
                progress[index].percentage = Math.floor(entry.intersectionRatio * entries); // Update the percentage for the corresponding progress bar
                this.setState({ progress });
            }
        });
    }

    render() {
        const { progress } = this.state;

        return (
            <div className='home'>
                <div className='ripple'>
                    <div>
                        <img className='request-loader' src={logo} alt="dp" />
                    </div>
                    <div className='title'>
                        <p>KRISHNA VAIBHAV</p>
                        <p>PROGRAMMER, PENETRATION TESTER, WEB DEVELOPER</p>               
                    </div>
                </div>
                <div className='sk'>
                {progress.map((skill, index) => (

            
                    <div className="skills" key={index} ref={ref => this.progressRefs[index] = ref}>
                        <div className="skill-name"><p>{skill.name}</p></div>
                        <div className="progress-bar" style={{ width: `${skill.percentage}%`, zIndex: 2 }}></div>

                    </div>
                ))}
                </div>
            </div>
        );
    }
}
