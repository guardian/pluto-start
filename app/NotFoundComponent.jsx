import React from 'react';
import {Link} from 'react-router-dom';

class NotFoundComponent extends React.Component {
    render() {
        return <div>
            <h1>Not found</h1>
            <p>Hmmmm, there is no page with that path in the frontend.</p>
            <Link to="/">Home</Link>
        </div>
    }
}

export default NotFoundComponent;