import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import parse from 'html-react-parser';
import eventBus from '../utils/eventBus';
import jobsDbAPI from '../utils/jobsDbAPI';

const JobDetails = () => {
    const [showDetails, setShowDetails] = useState(false);
    const [job, setJob] = useState(null);
    const [selectedTab, setSelectedTab] = useState('details');

    useEffect(() => {
        const unsubscribe = eventBus.jobSelected.subscribe(async (_id) => {
            const jobData = await jobsDbAPI.getJob(_id);
            setJob(jobData);
            setShowDetails(true);
        });

        // Cleanup function to unsubscribe on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    if (!showDetails || !job) {
        return null;
    }

    const tabStyle = {
        cursor: 'pointer',
        padding: '10px',
        margin: '10px',
    };

    const selectedTabStyle = {
        ...tabStyle,
        borderBottom: '2px solid black',
    };

    return (
        <div 
            style={{ 
                width: '50vw', 
                height: '100%', 
                display: showDetails ? 'grid' : 'none', 
                overflow: 'auto',
                gridTemplateRows: 'min-content 1fr',
                gap: '5px'
            }}
        >
            <div>
                <Button variant="outline-secondary" onClick={() => setShowDetails(false)}>Exit</Button>
                <span 
                    onClick={() => setSelectedTab('details')} 
                    style={selectedTab === 'details' ? selectedTabStyle : tabStyle}
                >
                    Details
                </span>
                <span 
                    onClick={() => setSelectedTab('json')} 
                    style={selectedTab === 'json' ? selectedTabStyle : tabStyle}
                >
                    Raw JSON
                </span>
            </div>
            {selectedTab === 'details' && (
                <div style={{
                    border: '1px solid #ccc', 
                    borderRadius: '5px', 
                    padding: '20px', 
                    marginBottom: '10px',
                    display: 'grid',
                    overflow: 'auto',
                    gridTemplateRows: 'min-content min-content 1fr'
                }}>
                    <h4>{job.title}</h4>
                    <h6 className="text-muted">{job.companyName}</h6>
                    <div style={{overflow: 'auto'}}>{parse(job.jobDescription || 'No Job Description')}</div>
                    {/* Render other properties of the job here */}
                </div>
            )}
            {selectedTab === 'json' && (
                <div style={{overflow: 'auto'}}>
                    <pre>{JSON.stringify(job, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default JobDetails;
