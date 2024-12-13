import { Link } from 'react-router-dom';

function CreateSessionBtn() {
    return (
        <div className="flex justify-center items-center scale-50">
            <Link to="/user/register">
                <button className="p-4 border rounded-lg bg-orange-400">Get started!</button>
            </Link>
        </div>
    );
}

export default CreateSessionBtn;