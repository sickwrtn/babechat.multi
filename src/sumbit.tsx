import './main.css'
import { FormControl, Button, Form ,ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Sumbit({resetFeedback, isAdmin}:{resetFeedback: ()=>void,isAdmin:boolean}){
    
    const [title,setTitle] = useState("");

    const [content,setContent] = useState("");
    
    const [password,setPassword] = useState("");

    const titleOnChange = (e: any) => setTitle(e.target.value);

    const contentOnChange = (e: any) => setContent(e.target.value);

    const passwordOnChange = (e: any) => setPassword(e.target.value);
    
    const [titleIsVaild,setTitleVaild] = useState(false);
    
    const [contentIsVaild,setContentVaild] = useState(false);

    const [passwordIsVaild,setPasswordVaild] = useState(false);

    const [category, setCategory] = useState<1 | 2 | 3>(1);

    const categoryOnChange = (val: any) => setCategory(val);

    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    
    const recaptchaOnChange = (val: any) => setRecaptchaToken(val);

    const recaptchaRef = useRef(null as any);
    
    const [isDarkmode,setIsDarkmode] = useState<boolean>((():boolean =>{
            if (localStorage.getItem("them") == null){
                localStorage.setItem("them","light");
                return false
            }
            else if (localStorage.getItem("them") == "light"){
                return false;
            }
            else if (localStorage.getItem("them") == "dark"){
                return true;
            }
            return false
        })());
    
    const isDarkmodeOnChange = (e: any) => setIsDarkmode(e.target.checked);

    const resetRecaptcha = () => {
        if (recaptchaRef.current) {
        recaptchaRef.current.reset(); // reCAPTCHA 체크박스 초기화
        setRecaptchaToken(null); // 저장된 토큰도 초기화
        }
    };

    async function formOnClick(title:string,content:string,category: number, password:string,recaptchaToken: string | null){
        const titleValid = title.trim().length > 0;
        const contentValid = content.trim().length > 0;
        const passwordValid = password.trim().length > 0;
    // 유효성 상태 업데이트
        setTitleVaild(!titleValid);
        setContentVaild(!contentValid);
        setPasswordVaild(!passwordValid);
        if (!titleValid || !contentValid || !passwordValid){
            return alert("잘못된 양식입니다.");
        }

        const res = await fetch("https://babe-api.fastwrtn.com/recaptcha",{method:"POST",headers:{"Content-Type" : "application/json"},body:JSON.stringify({
            recaptchaToken:recaptchaToken
        })})
        const res_json: any = await res.json();
        if (!(res_json.result == "SUCCESS")){
            resetRecaptcha();
            return alert("캡챠 인증 실패..");
        }
        if (isAdmin){
            var res2 = await fetch("https://babe-api.fastwrtn.com/admin/notification",{method:"POST",headers:{"Content-Type" : "application/json","Authorization":localStorage.getItem("auth_token") as string},body:JSON.stringify({
                title:title,
                content:content,
                category:category,
                password:password
            })})
        }
        else {
            var res2 = await fetch("https://babe-api.fastwrtn.com/feedback",{method:"POST",headers:{"Content-Type" : "application/json","Authorization":localStorage.getItem("auth_token") as string},body:JSON.stringify({
                title:title,
                content:content,
                category:category,
                password:password
            })})
        }
        const data = await res2.json()
        if (data.result == "FAIL" && data.data == "ban"){
            return alert(`차단되었습니다. 사유 : ${data.reason} 해제시간 : ${data.expiredAt}`);
        }
        else if (data.result == "FAIL") {
            return alert(`error ${data.data}`);
        }
        if (isAdmin) alert("공지사항 등록 성공!");
        else alert("건의사항 등록 성공!");
        resetRecaptcha();
        resetFeedback();
        setTitle("");
        setContent("");
    }

    useEffect(() => {
        if (isDarkmode){
            localStorage.setItem("them","dark");
            document.documentElement.setAttribute('data-bs-theme', "dark");
        }
        else {
            localStorage.setItem("them","light");
            document.documentElement.setAttribute('data-bs-theme', "light");
        }                              
    }, [isDarkmode]);

    return (
        <Form.Group className="m-4">
        <Form.Check // prettier-ignore
            type="switch"
            className='mb-3'
            label="다크 모드"
            checked={isDarkmode}
            onChange={isDarkmodeOnChange}
        />
        {isAdmin && <h2>공지사항</h2>}
        <Form.Label>제목</Form.Label>
        <FormControl type="text" placeholder="제목은 직관적이게 작성해주세요."  maxLength={20} value={title} onChange={titleOnChange} isInvalid={titleIsVaild}/>
        <Form.Text className="text-muted text-end d-block">{title.length}/20</Form.Text>
        <Form.Label>내용</Form.Label>
        <FormControl type="text" placeholder="건의사항을 구체적으로 적어주세요.&#10;마크다운을 지원합니다!&#10;![](이미지링크)" maxLength={65000} as="textarea" rows={3} value={content} onChange={contentOnChange} isInvalid={contentIsVaild}/> {/* 기본 3줄 높이 */}
        <Form.Text className="text-muted text-end d-block">{content.length}/65000</Form.Text>
        <Form.Label>비밀번호</Form.Label>
        <FormControl type="text" placeholder="비밀번호는 수정 및 삭제에 사용됩니다." maxLength={12} value={password} onChange={passwordOnChange} isInvalid={passwordIsVaild}/>
        <Form.Text className="text-muted text-end d-block">{password.length}/12</Form.Text>
        <div className='recaptcha-container'>
            <ReCAPTCHA
                sitekey="6LcMp0QrAAAAAIlT_zQPHX3RAGEbrm6pDSOTycau"
                onChange={recaptchaOnChange}
                ref={recaptchaRef}
                className='racaptcha'
            />
        </div>
        <ToggleButtonGroup className="d-inline-flex mt-3" type="radio" name="options" defaultValue={1} value={category} onChange={categoryOnChange}>
            <ToggleButton id="tbg-btn-1" variant='outline-secondary' value={1}>
                개선
            </ToggleButton>
            <ToggleButton id="tbg-btn-2" variant='outline-secondary' value={2}>
                버그
            </ToggleButton>
            <ToggleButton id="tbg-btn-3" variant='outline-secondary' value={3}>
                기타
            </ToggleButton>
        </ToggleButtonGroup>
        <Button disabled={!recaptchaToken} className="sumbit-btn mt-3" variant="success" id="button-addon1" onClick={()=>formOnClick(title,content,category,password,recaptchaToken)}>제출</Button>
    </Form.Group>
    )
} 