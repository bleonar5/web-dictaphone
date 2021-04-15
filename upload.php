<?php
$valid_extensions = array('jpeg', 'jpg', 'png','ogg', 'gif', 'bmp' , 'pdf' , 'doc' , 'ppt'); // valid extensions
$path = 'uploads/'; // upload directory
if($_FILES['image'])
{
$img = $_FILES['image']['name'];
$tmp = $_FILES['image']['tmp_name'];
// get uploaded file's extension
$ext = strtolower(pathinfo($img, PATHINFO_EXTENSION));
// can upload same image using rand function
//$final_image = rand(1000,1000000).$img;
// check's valid format
$path = $path.strtolower($final_image); 
move_uploaded_file($tmp,$path)

}
?>