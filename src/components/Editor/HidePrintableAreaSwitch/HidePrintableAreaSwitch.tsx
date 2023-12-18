import React from 'react';
import { Form } from 'react-bootstrap';
import { State } from "../../../data_type/interfaces";

interface Props {
    // You can define props here if needed
    editor: State;
    setEditor: (editorState: Record<string, any>, callback?: () => void) => void;
};

const MySwitchComponent: React.FC<Props> = ({editor, setEditor}) => {
  //const [isChecked, setChecked] = useState(false);

  const handleSwitchChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    // setChecked(!isChecked);
        const checked = e.currentTarget.checked;
        editor.canvasController.togglePrintableArea(checked)
        setEditor({isEditableAreaInvisible: checked})            
  };

  return (
    <Form>
    <Form.Check 
        type="switch" 
        id="myCheckbox" 
        label="Hide Printable Area"
        checked={editor.isEditableAreaInvisible}
        onChange={handleSwitchChange}
      />
    </Form>
  );
};

export default MySwitchComponent;

                //   <Form>
                //     <Form.Check 
                //       type="switch" 
                //       id="myCheckbox" 
                //       label="Hide Printable Area"
                //       onChange={
                        
                //       }
                //       />
                //   </Form>