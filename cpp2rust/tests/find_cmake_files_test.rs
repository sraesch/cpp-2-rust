#[cfg(test)]
mod test {
    use std::path::Path;

    use cpp2rust::cpp::find_cmake_project_files;

    #[test]
    fn test_finding_cmake_files() {
        let root_folder = Path::new("test_data/finding_cmake_lists");
        let result = find_cmake_project_files(root_folder);
        assert!(result.is_ok());
        let cmake_files = result.unwrap();
        assert_eq!(cmake_files.len(), 3);

        println!("{:?}", cmake_files);

        assert_eq!(
            cmake_files[0],
            Path::new("CMakeLists.txt"),
            "id=0, CMakeLists.txt not found"
        );

        assert_eq!(
            cmake_files[1],
            Path::new("a/CMakeLists.txt"),
            "id=1, a/CMakeLists.txt not found"
        );

        assert_eq!(
            cmake_files[2],
            Path::new("c/d/CMakeLists.txt"),
            "id=2, c/d/CMakeLists.txt not found"
        );
    }
}
